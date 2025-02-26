package handlers

import (
	"backend/database"
	"encoding/json"
	"log"
	"net/http"

	"github.com/lib/pq"
)

type me struct {
	ID                    int             `json:"id" db:"id"`
	UserID                *int            `json:"userId" db:"user_id"`
	FirstName             string          `json:"firstName" db:"first_name"`
	LastName              string          `json:"lastName" db:"last_name"`
	BirthDate             *string         `json:"birthDate" db:"birth_date"`
	Age                   *int            `json:"age" db:"age"`
	Gender                string          `json:"gender" db:"gender"`
	Biography             string          `json:"biography" db:"biography"`
	LocationCity          string          `json:"locationCity" db:"location_city"`
	Interests             pq.StringArray  `json:"interests" db:"interests"`
	MaxDistancePreference *int            `json:"maxDistancePreference" db:"max_distance_preference"`
	ProfilePicture        *string         `json:"profilePicture" db:"profile_picture"`
	SecurityQuestion      *string         `json:"securityQuestion" db:"security_question"`
	GolangProjects        *pq.StringArray `json:"golangProjects" db:"golang_projects"`
	JavascriptProjects    *pq.StringArray `json:"javascriptProjects" db:"javascript_projects"`
	Email                 string          `json:"email" db:"email"`
	Discord               string          `json:"discord" db:"discord"`
	MyProjects            string          `json:"myprojects" db:"my_projects"`
}

func MeHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, "User ID not found in context", http.StatusUnauthorized)
			return
		}

		//const profilePictureBaseURL = "http://localhost:8080/static/"

		var profile me
		query := `
        SELECT p.id, p.user_id, p.first_name, p.last_name, p.birth_date, p.age, p.gender, p.biography, 
            p.location_city, p.interests, p.max_distance_preference, p.profile_picture, 
            p.security_question, p.golang_projects, p.javascript_projects, u.email, p.discord, my_projects
        FROM profile p
        JOIN "user" u ON p.user_id = u.id
        WHERE p.user_id = $1
    `

		err := db.Pool.Get(&profile, query, userID)
		if err != nil {
			log.Printf("Failed to fetch profile data: %v", err)
			http.Error(w, "Failed to fetch profile data", http.StatusInternalServerError)
			return
		}

		if profile.ProfilePicture != nil {
			//log.Printf("Profile picture path: %s", *profile.ProfilePicture)
		} else {
			log.Println("Profile picture path is nil")
		}

		/*/ Construct the full URL for the profile picture
		if me.ProfilePicture != nil {
			fullProfilePictureURL := profilePictureBaseURL + *me.ProfilePicture
			me.ProfilePicture = &fullProfilePictureURL
		}*/

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(profile)
	}
}

//const profilePictureBaseURL = "http://localhost:8080/uploads/"

func JustMeHandler(db *database.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        userID, ok := r.Context().Value("userID").(int)
        if !ok {
            http.Error(w, "User ID not found in context", http.StatusUnauthorized)
            return
        }

        var profile struct {
            ID             int     `json:"id"`
            FirstName      string  `json:"first_name"`
            ProfilePicture *string `json:"profilePicture"`
        }

        query := `
        SELECT id, first_name, profile_picture
        FROM profile
        WHERE user_id = $1
    `

        err := db.Pool.QueryRow(query, userID).Scan(&profile.ID, &profile.FirstName, &profile.ProfilePicture)
        if err != nil {
            log.Printf("Failed to fetch profile data: %v", err)
            http.Error(w, "Failed to fetch profile data", http.StatusInternalServerError)
            return
        }

        if profile.ProfilePicture != nil {
            fullProfilePictureURL := profilePictureBaseURL + *profile.ProfilePicture
            profile.ProfilePicture = &fullProfilePictureURL
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(profile)
    }
}