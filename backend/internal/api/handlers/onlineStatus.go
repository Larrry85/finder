package handlers

import (
	"backend/database"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

const (
	onlineStatusTimeout = 1 * time.Minute
)

// UpdateOnlineStatus updates user's online status and handles cleanup
func UpdateOnlineStatus(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, "User ID not found in context", http.StatusUnauthorized)
			return
		}

		var req struct {
			IsOnline bool `json:"isOnline"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Start a transaction
		tx, err := db.Pool.Begin()
		if err != nil {
			log.Printf("Error starting transaction: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback()

		// Update user's online status
		_, err = tx.Exec(`
					UPDATE "user" 
					SET is_online = $1,
							last_seen = CURRENT_TIMESTAMP
					WHERE id = $2`,
			req.IsOnline, userID)
		if err != nil {
			log.Printf("Error updating online status: %v", err)
			http.Error(w, "Failed to update online status", http.StatusInternalServerError)
			return
		}

		// Clean up stale online statuses
		_, err = tx.Exec(`
					UPDATE "user"
					SET is_online = false
					WHERE is_online = true
					AND last_seen < $1`,
			time.Now().Add(-onlineStatusTimeout))
		if err != nil {
			log.Printf("Error cleaning up stale online statuses: %v", err)
			http.Error(w, "Failed to clean up stale statuses", http.StatusInternalServerError)
			return
		}

		if err := tx.Commit(); err != nil {
			log.Printf("Error committing transaction: %v", err)
			http.Error(w, "Failed to commit changes", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
