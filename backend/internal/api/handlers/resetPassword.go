package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/jmoiron/sqlx"
)

func ResetPasswordRequestHandler(db *sqlx.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request struct {
			Email            string `json:"email"`
			SecurityQuestion string `json:"securityQuestion"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			log.Println(err)
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		var userID int
		err := db.QueryRow(`SELECT id FROM "user" WHERE email = $1`, request.Email).Scan(&userID)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Email not found", http.StatusNotFound)
				return
			}
			log.Println(err)
			http.Error(w, "Failed to fetch user ID", http.StatusInternalServerError)
			return
		}

		var securityQuestion sql.NullString
		err = db.QueryRow(`SELECT security_question FROM profile WHERE user_id = $1`, userID).Scan(&securityQuestion)
		if err != nil {
			log.Println(err)
			http.Error(w, "Failed to fetch security question", http.StatusInternalServerError)
			return
		}

		if !securityQuestion.Valid {
			http.Error(w, "Security question is not set", http.StatusInternalServerError)
			return
		}

		// Convert both security questions to lower case for case-insensitive comparison
		if strings.ToLower(request.SecurityQuestion) != strings.ToLower(securityQuestion.String) {
			http.Error(w, "Invalid security word", http.StatusUnauthorized)
			return
		}

		// Generate a token that includes the user's ID
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"userID": userID,
			"exp":    time.Now().Add(1 * time.Hour).Unix(),
		})
		tokenString, err := token.SignedString(JwtKey)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(struct {
			Token string `json:"token"`
		}{
			Token: tokenString,
		})
	}
}

func ResetPasswordConfirmHandler(db *sqlx.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request struct {
			Token       string `json:"token"`
			NewPassword string `json:"newPassword"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		// Parse and validate token
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(request.Token, claims, func(token *jwt.Token) (interface{}, error) {
			return JwtKey, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		hashedPassword, err := HashPassword(request.NewPassword)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Convert userID to integer
		userIDFloat, ok := claims["userID"].(float64)
		if !ok {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Convert float64 userID to int
		userID := int(userIDFloat)

		_, err = db.Exec(`UPDATE "user" SET password = $1 WHERE id = $2`, hashedPassword, userID)
		if err != nil {
			http.Error(w, "Failed to update password", http.StatusInternalServerError)
			return
		}

		w.Write([]byte("Password has been reset successfully."))
	}
}
