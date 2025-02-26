package handlers

import (
	"backend/database/models"
	"encoding/json"
	"log"
	"net/http"

	"github.com/jmoiron/sqlx"
)

func RegisterHandler(db *sqlx.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var credentials struct {
			Email    string `json:"email"`
			Password string `json:"password"`
			UserName string `json:"username"`
		}

		if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		// Start transaction
		tx, err := db.Beginx()
		if err != nil {
			log.Printf("Failed to start transaction: %v", err)
			http.Error(w, "Could not start transaction", http.StatusInternalServerError)
			return
		}

		// Use a variable to track if we should rollback
		var txError error
		defer func() {
			if txError != nil {
				if rbErr := tx.Rollback(); rbErr != nil {
					log.Printf("Failed to rollback: %v", rbErr)
				}
			}
		}()

		// Check if user exists
		var existingUser models.User
		err = tx.Get(&existingUser, `SELECT id FROM "user" WHERE email = $1`, credentials.Email)
		if err == nil {
			http.Error(w, "User already exists", http.StatusConflict)
			txError = err
			return
		}

		// Hash password
		hashedPassword, err := HashPassword(credentials.Password)
		if err != nil {
			http.Error(w, "Could not hash password", http.StatusInternalServerError)
			return
		}

		// Insert user
		var userID int
		err = tx.QueryRow(
			`INSERT INTO "user" (email, password, username) VALUES ($1, $2, $3) RETURNING id`,
			credentials.Email, hashedPassword, credentials.UserName).Scan(&userID)
		if err != nil {
			log.Printf("Failed to insert user: %v", err)
			http.Error(w, "Could not register user", http.StatusInternalServerError)
			txError = err
			return
		}

		// Create empty profile
		_, err = tx.Exec(`
            INSERT INTO "profile" (
                id,
                user_id,
                first_name,
                last_name,
                birth_date,
                gender,
                age,
                location_city,
                biography,
                interests,
                max_distance_preference,
                profile_picture,
                is_seed,
								username
            ) VALUES ($1, $1, '', '', NULL, '', NULL, '', '', '{}', NULL, '', false , $2)`,
			userID, credentials.UserName)
		if err != nil {
			log.Printf("Failed to create profile: %v", err)
			http.Error(w, "Could not create profile", http.StatusInternalServerError)
			txError = err
			return
		}

		// Commit transaction
		if err = tx.Commit(); err != nil {
			log.Printf("Failed to commit transaction: %v", err)
			http.Error(w, "Could not commit transaction", http.StatusInternalServerError)
			txError = err
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Registration successful",
			"userId":  userID,
		})
	}
}
