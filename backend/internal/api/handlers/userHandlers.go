package handlers

import (
	"backend/database"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const profilePictureBaseURL = "http://localhost:8080/uploads/"

func UserHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userIDStr := r.URL.Path[len("/api/users/"):]
		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		var user struct {
			ID             int       `json:"id"`
			FirstName      string    `json:"firstName"`
			ProfilePicture *string   `json:"profilePicture"`
			IsOnline       bool      `json:"isOnline"` // Added this
			LastSeen       time.Time `json:"lastSeen"` // Added this
		}

		// Modified query to join with user table and get online status
		err = db.Pool.QueryRow(`
					SELECT p.id, p.first_name, p.profile_picture, u.is_online, u.last_seen
					FROM profile p
					JOIN "user" u ON u.id = p.user_id
					WHERE p.user_id = $1`,
			userID).Scan(
			&user.ID,
			&user.FirstName,
			&user.ProfilePicture,
			&user.IsOnline,
			&user.LastSeen,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found", http.StatusNotFound)
			} else {
				log.Printf("Error fetching user data: %v", err)
				http.Error(w, "Failed to fetch user data", http.StatusInternalServerError)
			}
			return
		}

		// Construct the full URL for the profile picture
		if user.ProfilePicture != nil {
			fullProfilePictureURL := profilePictureBaseURL + *user.ProfilePicture
			user.ProfilePicture = &fullProfilePictureURL
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func ConnectionsHandler(db *database.DB) http.HandlerFunc { // /connections/
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, "User ID not found in context", http.StatusUnauthorized)
			return
		}

		rows, err := db.Pool.Query(
			`SELECT id
             FROM friends
             WHERE sender_id = $1 OR receiver_id = $1`, userID)
		if err != nil {
			log.Printf("Failed to fetch connections: %v", err)
			http.Error(w, "Failed to fetch connections", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var connections []struct {
			ID int `json:"id"`
		}

		for rows.Next() {
			var connection struct {
				ID int `json:"id"`
			}
			if err := rows.Scan(&connection.ID); err != nil {
				log.Printf("Failed to scan connection: %v", err)
				http.Error(w, "Failed to fetch connections", http.StatusInternalServerError)
				return
			}
			connections = append(connections, connection)
		}

		log.Printf("Fetched connections: %+v", connections)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(connections)
	}
}

func UserBioHandler(db *database.DB) http.HandlerFunc { // /users/{id}/bio
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Full URL path: %s", r.URL.Path)

		// Normalize the path by removing trailing slashes
		path := strings.TrimSuffix(r.URL.Path, "/") // Removes trailing slashes
		//log.Printf("Normalized path: %s", path)

		// Trim the prefix /users/ to get the user-specific part
		path = strings.TrimPrefix(path, "/users/")
		//log.Printf("Trimmed path: %s", path)

		// Split the path into parts
		parts := strings.Split(path, "/")
		//log.Printf("Extracted parts: %+v", parts)

		// Handle /users/{id}/bio
		if len(parts) == 2 && parts[1] == "bio" {
			// Format: /users/{id}/bio
			//log.Println("Matched: /users/{id}/bio")
			userID, err := strconv.Atoi(parts[0])
			if err != nil {
				log.Printf("Error converting userID: '%s', Error: %v", parts[0], err)
				http.Error(w, "Invalid user ID", http.StatusBadRequest)
				return
			}
			//log.Printf("UserID: %d", userID)
			handleUserBio(w, userID, db)
			return
		}

		// Invalid path
		log.Printf("Invalid path structure: %+v", parts)
		http.Error(w, "Invalid path", http.StatusBadRequest)
	}
}

func handleUserBio(w http.ResponseWriter, userID int, db *database.DB) {
	var user struct {
		ID        int     `json:"id"`
		FirstName string  `json:"first_name"`
		Bio       *string `json:"bio"`
	}

	err := db.Pool.QueryRow(
		`SELECT id, first_name, biography
         FROM profile
         WHERE user_id = $1`, userID).Scan(&user.ID, &user.FirstName, &user.Bio)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch user data", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func MeBioHandler(db *database.DB) http.HandlerFunc { // api/users/me/bio
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, "User ID not found in context", http.StatusUnauthorized)
			return
		}

		var user struct {
			ID        int     `json:"id"`
			FirstName string  `json:"first_name"`
			Bio       *string `json:"bio"`
		}

		err := db.Pool.QueryRow(
			`SELECT id, first_name, biography
             FROM profile
             WHERE user_id = $1`, userID).Scan(&user.ID, &user.FirstName, &user.Bio)

		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to fetch user data", http.StatusInternalServerError)
			}
			return
		}

		log.Printf("Fetched user bio: %+v", user)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}
