package main

import (
	"flag"
	"log"
	"net/http"
	"path/filepath"
	"time"

	"backend/database"
	"backend/internal/api/handlers"
	"backend/internal/api/middleware"

	"golang.org/x/net/websocket"
)

const onlineStatusTimeout = 1 * time.Minute

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if origin == "http://localhost:5173" || origin == "http://127.0.0.1:5173" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, removeProfilePicture")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Add command-line flags for database seeding
	seedPtr := flag.Bool("seed", false, "seed the database with test users")
	clearPtr := flag.Bool("clear", false, "clear existing users before seeding")
	countPtr := flag.Int("count", 2000, "number of test users to generate")
	flag.Parse()

	// Load configuration and connect to the database
	config := database.LoadConfig()
	db := database.ConnectDB(config)
	defer db.Pool.Close()

	// Execute SQL schema file
	sqlFilePath := filepath.Join("database/user.sql")
	database.ExecuteSQLFile(db.Pool, sqlFilePath)

	// Handle database clearing if requested
	if *clearPtr {
		if err := db.ClearDatabase(); err != nil {
			log.Printf("Warning: Failed to clear database: %v\n", err)
		}
	}

	// Handle database seeding if requested
	if *seedPtr {
		if err := db.SeedDatabase(*countPtr); err != nil {
			log.Printf("Warning: Failed to seed database: %v\n", err)
		}
	}

	// Set up the endpoints
	mux := http.NewServeMux()
	mux.HandleFunc("/api/register", handlers.RegisterHandler(db.Pool))
	mux.HandleFunc("/api/login", handlers.LoginHandler(db.Pool))
	mux.HandleFunc("/api/reset-password/request", handlers.ResetPasswordRequestHandler(db.Pool))
	mux.HandleFunc("/api/reset-password/confirm", handlers.ResetPasswordConfirmHandler(db.Pool))
	mux.HandleFunc("/api/cities", handlers.GetCities)

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("backend/uploads"))))

	// Protected routes
	mux.Handle("/api/profile/update", middleware.AuthMiddleware(http.HandlerFunc(handlers.UpdateUserProfile(db))))
	mux.Handle("/api/home", middleware.AuthMiddleware(http.HandlerFunc(handlers.HomeHandler(db))))
	mux.Handle("/api/recommendation/", middleware.AuthMiddleware(http.HandlerFunc(handlers.RecommendationHandler(db))))
	mux.Handle("/api/profile/upload-picture", middleware.AuthMiddleware(http.HandlerFunc(handlers.UpdateUserProfile(db))))
	mux.Handle("/api/buddySettings", middleware.AuthMiddleware(http.HandlerFunc(handlers.SearchSettingsHandler(db))))

	mux.Handle("/api/friendbuddy", middleware.AuthMiddleware(http.HandlerFunc(handlers.FriendBuddyHandler(db))))
	mux.Handle("/api/friendrequests", middleware.AuthMiddleware(http.HandlerFunc(handlers.FriendRequestsHandler(db))))
	mux.Handle("/api/acceptfriend", middleware.AuthMiddleware(http.HandlerFunc(handlers.AcceptFriendHandler(db))))
	mux.Handle("/api/unfriendbuddy", middleware.AuthMiddleware(http.HandlerFunc(handlers.UnfriendBuddyHandler(db))))
	mux.Handle("/api/buddyprofile/", middleware.AuthMiddleware(http.HandlerFunc(handlers.BuddyProfileHandler(db))))
	mux.Handle("/api/chat", middleware.AuthMiddleware(http.HandlerFunc(handlers.ChatHandler(db))))

	// WebSocket handlers for chat and typing indicators
	mux.Handle("/ws/chat", websocket.Handler(handlers.HandleConnections))
	mux.Handle("/ws/typing", websocket.Handler(handlers.HandleTypingConnections))

	// Start WebSocket handlers in separate goroutines
	go handlers.HandleMessages()
	go handlers.HandleTypingIndicators()

	mux.Handle("/api/user", middleware.AuthMiddleware(http.HandlerFunc(handlers.FetchUserData)))

	mux.Handle("/api/connections/", middleware.AuthMiddleware(http.HandlerFunc(handlers.ConnectionsHandler(db))))
	mux.Handle("/api/recommendations/", middleware.AuthMiddleware(http.HandlerFunc(handlers.RecomHandler(db))))

	mux.Handle("/api/users/me/", middleware.AuthMiddleware(http.HandlerFunc(handlers.JustMeHandler(db))))
	mux.Handle("/api/users/profile/", middleware.AuthMiddleware(http.HandlerFunc(handlers.GetProfileHandler(db))))

	mux.Handle("/api/users/", middleware.AuthMiddleware(http.HandlerFunc(handlers.UserHandler(db))))
	mux.Handle("/api/users/{id}", middleware.AuthMiddleware(http.HandlerFunc(handlers.UserHandler(db))))
	mux.Handle("/users/", middleware.AuthMiddleware(http.HandlerFunc(handlers.UserBioHandler(db))))

	mux.Handle("/api/users/me/profile/", middleware.AuthMiddleware(http.HandlerFunc(handlers.MeHandler(db))))
	mux.Handle("/api/users/me/bio/", middleware.AuthMiddleware(http.HandlerFunc(handlers.MeBioHandler(db))))

	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads"))))

	mux.Handle("/api/online-status", middleware.AuthMiddleware(http.HandlerFunc(handlers.UpdateOnlineStatus(db))))
	mux.Handle("/api/messages/mark-read", middleware.AuthMiddleware(http.HandlerFunc(handlers.MarkMessagesAsRead(db))))

	// Add periodic cleanup for stale online statuses
	go func() {
		ticker := time.NewTicker(onlineStatusTimeout)
		defer ticker.Stop()

		for range ticker.C {
			_, err := db.Pool.Exec(`
                UPDATE "user"
                SET is_online = false
                WHERE is_online = true
                AND last_seen < $1`,
				time.Now().Add(-onlineStatusTimeout))
			if err != nil {
				log.Printf("Error in periodic online status cleanup: %v", err)
			}
		}
	}()

	// Enable CORS
	handler := enableCORS(mux)

	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
