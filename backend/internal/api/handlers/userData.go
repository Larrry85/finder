package handlers

import (
	"backend/database/models"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

// FetchUserData fetches user data by user ID
func FetchUserData(w http.ResponseWriter, r *http.Request) {
	// Get the user ID from the URL (assuming it's passed as a query parameter or path parameter)
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	// Open a database connection (use your own database connection setup)
	db, err := sql.Open("postgres", "user=youruser dbname=yourdb sslmode=disable")
	if err != nil {
		log.Println("Failed to connect to the database:", err)
		http.Error(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Query the database for the user by ID
	var user models.User
	err = db.QueryRow("SELECT id, email, first_name, last_name FROM users WHERE id = $1", userID).Scan(&user.ID, &user.Email, &user.FirstName, &user.LastName)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch user data", http.StatusInternalServerError)
		}
		return
	}

	// Convert the user data to JSON
	response, err := json.Marshal(user)
	if err != nil {
		http.Error(w, "Failed to marshal user data", http.StatusInternalServerError)
		return
	}

	// Set response header and send the user data
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
}
