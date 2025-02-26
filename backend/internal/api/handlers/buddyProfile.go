// THIS WILL SHOW PROFILE IN BUDDYPAGE, BUT NOT CORRECT ONES:

package handlers

import (
	"backend/database"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/lib/pq"
)

func BuddyProfileHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract the current user ID
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			log.Println("User ID not found in context")
			http.Error(w, "User ID not found in context", http.StatusUnauthorized)
			return
		}
		// Print the current user ID
		//log.Printf("Current user ID: %d", userID)

		// Extract the friend's ID from the URL
		// Assuming the URL is in the form /api/buddyprofile/{friendID}
		friendID := r.URL.Path[len("/api/buddyprofile/"):]

		// Parse the friend's ID from the URL path
		// If it fails, return a Bad Request error
		friendIDInt, err := strconv.Atoi(friendID)
		if err != nil {
			log.Println("Invalid friend ID")
			http.Error(w, "Invalid friend ID", http.StatusBadRequest)
			return
		}

		//log.Printf("Friend ID: %d", friendIDInt)

		// Print the specific row from the friends table
		var friend struct {
			ID         int    `json:"id"`
			SenderID   int    `json:"sender_id"`
			ReceiverID int    `json:"receiver_id"`
			CreatedAt  string `json:"created_at"`
		}

		err = db.Pool.QueryRow(
			`SELECT id, sender_id, receiver_id, created_at
            FROM friends
            WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
			friendID, userID).Scan(&friend.ID, &friend.SenderID, &friend.ReceiverID, &friend.CreatedAt)

		//log.Printf("SenderID: %d and ReceiverID: %d", friend.SenderID, friend.ReceiverID)

		if err != nil {
			log.Printf("Error fetching row for userID %d and friendID %d from friends table: %v", userID, friendIDInt, err)
		} else {
			//log.Printf("Fetched row from friends table: %+v", friend) // CORRECT!!!
		}

		// Determine if the current user is the sender or receiver, and show the other user's profile
		var profileID int
		if userID == friend.SenderID {
			profileID = friend.ReceiverID
		} else if userID == friend.ReceiverID {
			profileID = friend.SenderID
		} else {
			log.Println("Current user is neither sender nor receiver")
			http.Error(w, "Buddy not found", http.StatusNotFound)
			return
		}

		// Friend's profile ID
		//log.Printf("Profile ID to show in buddy page: %d", profileID) // CORRECT!!!

		// Fetch friend's profile from the profile table
		var profile struct {
			ID                    int      `json:"id" db:"id"`
			UserID                int      `json:"userId" db:"user_id"`
			FirstName             string   `json:"firstName" db:"first_name"`
			LastName              string   `json:"lastName" db:"last_name"`
			BirthDate             *string  `json:"birthDate" db:"birth_date"` // Use pointer to handle NULL values
			Age                   int      `json:"age" db:"age"`
			Gender                *string  `json:"gender" db:"gender"`              // Use pointer to handle NULL values
			LocationCity          *string  `json:"locationCity" db:"location_city"` // Use pointer to handle NULL values
			Interests             []string `json:"interests" db:"interests"`        // Use pq.StringArray for JSON array
			Biography             *string  `json:"biography" db:"biography"`        // Use pointer to handle NULL values
			MaxDistancePreference *int     `json:"max_distance_preference"`
			ProfilePicture        *string  `json:"profilePicture" db:"profile_picture"` // Use pointer to handle NULL values
			GolangProjects        []string `json:"golangProjects" db:"golang_projects"`
			JavascriptProjects    []string `json:"javascriptProjects" db:"javascript_projects"`
			Discord               string   `json:"discord" db:"discord"`
			MyProjects            string   `json:"myprojects" db:"my_projects"`
		}

		err = db.Pool.QueryRow(
			`SELECT id, user_id, first_name, last_name, birth_date, age, gender, biography, location_city, interests, max_distance_preference, profile_picture, golang_projects, javascript_projects, discord, my_projects
            FROM profile
            WHERE user_id = $1`, profileID).Scan(
			&profile.ID, &profile.UserID, &profile.FirstName, &profile.LastName, &profile.BirthDate, &profile.Age, &profile.Gender, &profile.Biography, &profile.LocationCity, pq.Array(&profile.Interests), &profile.MaxDistancePreference, &profile.ProfilePicture, pq.Array(&profile.GolangProjects), pq.Array(&profile.JavascriptProjects), &profile.Discord, &profile.MyProjects)

		if err != nil {
			log.Printf("Error fetching buddy profile: %v", err)
			http.Error(w, "Buddy not found", http.StatusNotFound)
			return
		}

		//log.Printf("Fetched buddy profile: %+v", profile)

		// Return the friend's profile as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(profile)
	}
}
