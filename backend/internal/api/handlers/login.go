package handlers

import (
	"backend/database/models"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/jmoiron/sqlx"
)

var JwtKey = []byte("1234")

type Claims struct {
	Email  string `json:"email"`
	UserID int    `json:"userId"`
	jwt.RegisteredClaims
}

type LoginResponse struct {
	Message           string `json:"message"`
	Token             string `json:"token"`
	UserID            int    `json:"userId"`
	IsProfileComplete bool   `json:"isProfileComplete"`
}

func LoginHandler(db *sqlx.DB) http.HandlerFunc {
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
		}
		if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
			log.Printf("Failed to decode request body: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		var user models.User
		query := `SELECT id, email, password FROM "user" WHERE email = $1`
		err := db.Get(&user, query, credentials.Email)
		if err != nil {
			log.Printf("Failed to find user with email %s: %v", credentials.Email, err)
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		// Use VerifyPassword function to check the password
		if !VerifyPassword(credentials.Password, user.Password) {
			log.Printf("Password mismatch for user %s", credentials.Email)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid email or password"})
			return
		}

		// Check if profile is complete
		var profile struct {
			FirstName string `db:"first_name"`
			LastName  string `db:"last_name"`
		}
		profileQuery := `SELECT first_name, last_name FROM "profile" WHERE user_id = $1`
		err = db.Get(&profile, profileQuery, user.ID)
		isProfileComplete := err == nil && profile.FirstName != "" && profile.LastName != ""

		// Generate JWT token
		expirationTime := time.Now().Add(24 * time.Hour)
		claims := &Claims{
			Email:  user.Email,
			UserID: user.ID,
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(expirationTime),
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString(JwtKey)
		if err != nil {
			log.Printf("Failed to create token: %v", err)
			http.Error(w, "Could not create token", http.StatusInternalServerError)
			return
		}

		//log.Printf("User %s logged in successfully", user.Email)
        //log.Printf("Generated Token in login.go: %s", tokenString)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		response := LoginResponse{
			Message:           "Login successful",
			Token:             tokenString,
			UserID:            user.ID,
			IsProfileComplete: isProfileComplete,
		}

		json.NewEncoder(w).Encode(response)
	}
}
