package handlers

import (
	"backend/database"
	"encoding/json"
	"log"
	"net/http"
)

type Recommendation struct {
    ID                    string   `json:"id"`
    UserID                int      `json:"userId"`
    Name                  string   `json:"name"`
    BirthDate             string   `json:"birthDate"`
    Age                   int      `json:"age"`
    Gender                string   `json:"gender"`
    Biography             string   `json:"biography"`
    LocationCity          string   `json:"locationCity"`
    Interests             []string `json:"interests"`
    ProfilePicture        string   `json:"profilePicture"`
    GolangProjects        []string `json:"golangProjects"`
    JavascriptProjects    []string `json:"javascriptProjects"`
    MatchPercentage       int      `json:"matchPercentage"`
    AgeRangeMin           int      `json:"ageRangeMin"`
    AgeRangeMax           int      `json:"ageRangeMax"`
}

var friends = make(map[string]Recommendation)

//works with Requests.tsx

// Friend button
func FriendBuddyHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			SenderID   int `json:"senderId" db:"sender_id"`
			ReceiverID int `json:"receiverId" db:"receiver_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("Failed to decode request payload: %v", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		//log.Printf("Sender ID: %d, Receiver ID: %d", req.SenderID, req.ReceiverID)

		/*/ Prevent users from sending friend requests to themselves
		  if req.SenderID == req.ReceiverID {
		      http.Error(w, "You cannot send a friend request to yourself", http.StatusBadRequest)
		      return
		  }// ????? Problem if user1 and user2 are in different order in user table and profile table ????????
		*/

		// Insert friend request into the friend_request table
		_, err := db.Pool.Exec(`INSERT INTO friend_request (sender_id, receiver_id, status) VALUES ($1, $2, 'pending')`, req.SenderID, req.ReceiverID)
		if err != nil {
			log.Printf("Failed to send friend request: %v", err)
			http.Error(w, "Failed to send friend request", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	}
}
