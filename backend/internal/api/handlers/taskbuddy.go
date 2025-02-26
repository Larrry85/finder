package handlers

import (
	"backend/database"
	"encoding/json"
	"log"
	"net/http"

	"github.com/lib/pq"
)

type FriendRequest struct {
	ID         int    `json:"id" db:"id"`
	SenderID   int    `json:"senderId" db:"sender_id"`
	ReceiverID int    `json:"receiverId" db:"receiver_id"`
	Status     string `json:"status" db:"status"`
	CreatedAt  string `json:"createdAt" db:"created_at"`
}

type TaskbuddyMatch struct {
	ID                 int            `json:"id" db:"id"`
	SenderID           int            `json:"senderId" db:"sender_id"`
	ReceiverID         int            `json:"receiverId" db:"receiver_id"`
	FirstName          string         `json:"firstName" db:"first_name"`
	LastName           string         `json:"lastName" db:"last_name"`
	Age                *int           `json:"age" db:"age"`
	LocationCity       *string        `json:"locationCity" db:"location_city"`     // Use pointer to handle NULL values
	Interests          pq.StringArray `json:"interests" db:"interests"`            // Use pq.StringArray for JSON array
	Biography          *string        `json:"biography" db:"biography"`            // Use pointer to handle NULL values
	ProfilePicture     *string        `json:"profilePicture" db:"profile_picture"` // Use pointer to handle NULL values
	CreatedAt          string         `json:"createdAt" db:"created_at"`
	GolangProjects     pq.StringArray `json:"golangProjects" db:"golang_projects"`
	JavascriptProjects pq.StringArray `json:"javascriptProjects" db:"javascript_projects"`
}

// Show pending, sent and accepted friend requests
func FriendRequestsHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, "User ID not found in context", http.StatusUnauthorized)
			return
		}

		var pendingRequests []TaskbuddyMatch
		var sentRequests []TaskbuddyMatch
		var friends []TaskbuddyMatch
		var removedProfiles []TaskbuddyMatch

		// Fetch pending friend requests where the user is the receiver
		pendingQuery := `
            SELECT fr.id, fr.sender_id, fr.receiver_id, p.first_name, p.last_name, p.age, p.location_city, p.interests, p.biography, p.profile_picture, p.golang_projects, p.javascript_projects, fr.created_at
            FROM friend_request fr
            JOIN profile p ON fr.sender_id = p.user_id
            WHERE fr.receiver_id = $1 AND fr.status = 'pending'
            AND fr.sender_id NOT IN (
                SELECT receiver_id FROM friends WHERE sender_id = $1
                UNION
                SELECT sender_id FROM friends WHERE receiver_id = $1
                UNION
                SELECT receiver_id FROM removed_profiles WHERE sender_id = $1
                UNION
                SELECT sender_id FROM removed_profiles WHERE receiver_id = $1
            )
            ORDER BY fr.created_at DESC
        `
		if err := db.Pool.Select(&pendingRequests, pendingQuery, userID); err != nil {
			log.Printf("Failed to fetch pending friend requests: %v", err)
			http.Error(w, "Failed to fetch pending friend requests", http.StatusInternalServerError)
			return
		}

		// Fetch sent friend requests
		sentQuery := `
            SELECT fr.id, fr.sender_id, fr.receiver_id, p.first_name, p.last_name, p.age, p.location_city, p.interests, p.biography, p.profile_picture, p.golang_projects, p.javascript_projects, fr.created_at
            FROM friend_request fr
            JOIN profile p ON fr.receiver_id = p.user_id
            WHERE fr.sender_id = $1 AND fr.status = 'pending'
            ORDER BY fr.created_at DESC
        `
		if err := db.Pool.Select(&sentRequests, sentQuery, userID); err != nil {
			log.Printf("Failed to fetch sent friend requests: %v", err)
			http.Error(w, "Failed to fetch sent friend requests", http.StatusInternalServerError)
			return
		}

		// Fetch friends
		friendsQuery := `
            WITH LastMessage AS (
                SELECT 
                    CASE 
                        WHEN sender_id = $1 THEN receiver_id
                        WHEN receiver_id = $1 THEN sender_id
                    END as friend_id,
                    MAX(timestamp) as last_message_time
                FROM chat_message
                WHERE sender_id = $1 OR receiver_id = $1
                GROUP BY CASE 
                    WHEN sender_id = $1 THEN receiver_id
                    WHEN receiver_id = $1 THEN sender_id
                END
            )
            SELECT 
                f.id, 
                f.sender_id, 
                f.receiver_id, 
                p.first_name, 
                p.last_name, 
                COALESCE(p.age, 0) as age, 
                COALESCE(p.location_city, '') as location_city, 
                COALESCE(p.interests, '{}') as interests, 
                COALESCE(p.biography, '') as biography, 
                p.profile_picture, 
                COALESCE(p.golang_projects, '{}') as golang_projects, 
                COALESCE(p.javascript_projects, '{}') as javascript_projects, 
                f.created_at
            FROM friends f
            JOIN profile p ON (f.sender_id = p.user_id OR f.receiver_id = p.user_id)
            LEFT JOIN LastMessage lm ON 
                CASE 
                    WHEN f.sender_id = $1 THEN f.receiver_id
                    WHEN f.receiver_id = $1 THEN f.sender_id
                END = lm.friend_id
            WHERE (f.sender_id = $1 OR f.receiver_id = $1) 
                AND p.user_id != $1
            ORDER BY COALESCE(lm.last_message_time, f.created_at) DESC NULLS LAST
        `
		if err := db.Pool.Select(&friends, friendsQuery, userID); err != nil {
			log.Printf("Failed to fetch friends: %v", err)
			http.Error(w, "Failed to fetch friends", http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"pendingRequests": pendingRequests,
			"sentRequests":    sentRequests,
			"friends":         friends,
			"removedProfiles": removedProfiles,
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Printf("Failed to encode response: %v", err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		}
	}
}

func AcceptFriendHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			SenderID   int `json:"senderId"`
			ReceiverID int `json:"receiverId"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		//log.Printf("Accepting friend request: SenderID=%d, ReceiverID=%d", req.SenderID, req.ReceiverID) // correct sender ID, correct receiver ID

		// Check if the friend request exists and is pending in friend_request table
		var existingRequest struct {
			ID         int    `db:"id"`
			SenderID   int    `db:"sender_id"`
			ReceiverID int    `db:"receiver_id"`
			Status     string `db:"status"`
			CreatedAt  string `db:"created_at"`
		}
		err := db.Pool.Get(&existingRequest, `SELECT id, sender_id, receiver_id, status, created_at FROM friend_request WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'`, req.SenderID, req.ReceiverID)
		if err != nil {
			log.Printf("Friend request not found: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Friend request not found"})
			return
		}

		// Add to friends table
		_, err = db.Pool.Exec(`INSERT INTO friends (sender_id, receiver_id) VALUES ($1, $2)`, req.SenderID, req.ReceiverID)
		if err != nil {
			log.Printf("Failed to add friend: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to add friend"})
			return
		}

		// Remove from friend_request table after friend request has been accepted
		_, err = db.Pool.Exec(`DELETE FROM friend_request WHERE sender_id = $1 AND receiver_id = $2`, req.SenderID, req.ReceiverID)
		if err != nil {
			log.Printf("Failed to remove friend request: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to remove friend request"})
			return
		}

		// Fetch the newly added friend profile
		var newFriend TaskbuddyMatch
		err = db.Pool.Get(&newFriend, `
            SELECT p.user_id AS id, p.first_name, p.last_name, p.age, p.location_city, p.interests, p.biography, p.profile_picture
            FROM profile p
            WHERE p.user_id = $1
        `, req.ReceiverID)
		if err != nil {
			log.Printf("Failed to fetch new friend profile: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch new friend profile"})
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":     "success",
			"newFriend":  newFriend,
			"senderId":   req.SenderID,
			"receiverId": req.ReceiverID,
		})
	}
}

// Remove profile card
func UnfriendBuddyHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			SenderID   int `json:"senderId"`
			ReceiverID int `json:"receiverId"`
		}
		userID, ok := r.Context().Value("userID").(int)
		log.Printf("UserID: userID=%d", userID)
		if !ok {
			http.Error(w, "User ID not found in context", http.StatusUnauthorized)
			return
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		var err error // Declare the err variable here

		//log.Printf("Request SenderID=%d, ReceiverID=%d", req.SenderID, req.ReceiverID)

		// Add removed cards into removed profiles table
		_, err = db.Pool.Exec(`INSERT INTO removed_profiles (sender_id, receiver_id) VALUES ($1, $2) ON CONFLICT (sender_id, receiver_id) DO NOTHING`, req.SenderID, req.ReceiverID)
		if err != nil {
			log.Printf("Failed to add to removed_profiles: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to add to removed_profiles"})
			return
		}
		//log.Printf("Removing profile card AFTER ADDING TO REMOVED PROFILES: SenderID=%d, ReceiverID=%d", req.SenderID, req.ReceiverID)

		// Remove from friends table
		_, err = db.Pool.Exec(`DELETE FROM friends WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`, req.SenderID, req.ReceiverID)
		log.Printf("Delete from friends table: SenderID=%d, ReceiverID=%d", req.SenderID, req.ReceiverID)
		if err != nil {
			log.Printf("Failed to remove friend: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to remove friend"})
			return
		}

		// Remove from friend_request table
		_, err = db.Pool.Exec(`DELETE FROM friend_request WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`, req.SenderID, req.ReceiverID)
		log.Printf("Delete from friend request table: SenderID=%d, ReceiverID=%d", req.SenderID, req.ReceiverID)
		if err != nil {
			log.Printf("Failed to remove friend request: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to remove friend request"})
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "success",
		})
	}
}
