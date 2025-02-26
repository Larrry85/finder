package middleware

import (
	"context"
	//"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v4"
)

var jwtKey = []byte("1234")

// Claims defines the structure of the JWT claims
type Claims struct {
	Email  string `json:"email"` // Changed from Username to Email
	UserID int    `json:"userId"`
	jwt.RegisteredClaims
}

// AuthMiddleware checks for a valid JWT token
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" || !strings.HasPrefix(tokenString, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		tokenString = tokenString[len("Bearer "):] // Remove "Bearer " prefix

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Log the extracted user ID for debugging
		//log.Printf("Extracted user ID from token: %d", claims.UserID)

		// Set the user ID in the context
		ctx := context.WithValue(r.Context(), "userID", claims.UserID)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
