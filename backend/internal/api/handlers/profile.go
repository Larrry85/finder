package handlers

import (
	"backend/database"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/lib/pq"
)

type Profile struct {
	ID                    int             `json:"id" db:"id"`
	UserID                *int            `json:"userId" db:"user_id"`
	FirstName             string          `json:"firstName" db:"first_name"`
	LastName              string          `json:"lastName" db:"last_name"`
	BirthDate             *string         `json:"birthDate" db:"birth_date"`
	Age                   *int            `json:"age" db:"age"`
	Gender                string          `json:"gender" db:"gender"`
	Biography             string          `json:"biography" db:"biography"`
	LocationCity          string          `json:"locationCity" db:"location_city"`
	LocationType          string          `json:"location_type" db:"location_type"`
	Interests             pq.StringArray  `json:"interests" db:"interests"`
	MaxDistancePreference *int            `json:"maxDistancePreference" db:"max_distance_preference"`
	ProfilePicture        *string         `json:"profilePicture" db:"profile_picture"`
	SecurityQuestion      *string         `json:"securityQuestion" db:"security_question"`
	GolangProjects        *pq.StringArray `json:"golangProjects" db:"golang_projects"`
	JavascriptProjects    *pq.StringArray `json:"javascriptProjects" db:"javascript_projects"`
	Email                 string          `json:"email" db:"email"`
	Discord               string          `json:"discord" db:"discord"`
	MyProjects            string          `json:"myprojects" db:"my_projects"`
	Username              string          `json:"username" db:"username"`
}

func GetProfileHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, "User ID not found in context", http.StatusUnauthorized)
			return
		}

		var profile Profile
		query := `
			SELECT 
				p.id, p.user_id, p.first_name, p.last_name, p.birth_date, 
				p.age, p.gender, p.biography, p.location_city, p.interests, 
				p.max_distance_preference, p.profile_picture, p.security_question, 
				p.golang_projects, p.javascript_projects, u.email, p.discord, 
				p.my_projects, u.username
			FROM profile p
			JOIN "user" u ON p.user_id = u.id
			WHERE p.user_id = $1
		`

		err := db.Pool.Get(&profile, query, userID)
		if err != nil {
			if err.Error() == "sql: no rows in result set" {
				//log.Printf("Creating new profile for user ID: %d", userID)

				// First, fetch the username from user table
				var username string
				err = db.Pool.Get(&username, `SELECT username FROM "user" WHERE id = $1`, userID)
				if err != nil {
					log.Printf("Failed to fetch username: %v", err)
					http.Error(w, "Failed to fetch username", http.StatusInternalServerError)
					return
				}

				// Now create the profile with the username
				_, err = db.Pool.Exec(`
					INSERT INTO profile (
						user_id, first_name, last_name, birth_date, gender,
						age, location_city, biography, interests,
						max_distance_preference, profile_picture, security_question, 
						golang_projects, javascript_projects, is_seed, discord, my_projects, username
					) VALUES (
						$1, '', '', NULL, '', 
						NULL, '', '', '{}', 
						NULL, '', '', '{}', 
						'{}', false, '', '', $2
					)
				`, userID, username)

				if err != nil {
					log.Printf("Failed to create empty profile: %v", err)
					http.Error(w, "Failed to create profile", http.StatusInternalServerError)
					return
				}

				// Set initial profile data
				profile = Profile{
					UserID:         &userID,
					Username:       username,
					FirstName:      "",
					LastName:       "",
					Interests:      pq.StringArray{},
					ProfilePicture: nil,
				}
			} else {
				log.Printf("Failed to fetch profile data: %v", err)
				http.Error(w, "Failed to fetch profile data", http.StatusInternalServerError)
				return
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(profile)
	}
}

func UpdateUserProfile(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			log.Printf("Error: User ID not found in context")
			http.Error(w, "User ID not found", http.StatusUnauthorized)
			return
		}

		var profilePicture string
		var removeProfilePicture bool

		if r.Method == http.MethodDelete {
			removeProfilePicture = r.Header.Get("removeProfilePicture") == "true"
			//log.Printf("DELETE request with removeProfilePicture: %v", removeProfilePicture)
		} else {
			if err := r.ParseMultipartForm(5 * 1024 * 1024); err != nil {
				log.Printf("Error parsing multipart form: %v", err)
				http.Error(w, "Invalid input: file too large or invalid form data", http.StatusBadRequest)
				return
			}

			if file, handler, err := r.FormFile("profilePicture"); err == nil {
				defer file.Close()

				if handler.Size > 5*1024*1024 {
					log.Printf("File too large: %d bytes", handler.Size)
					http.Error(w, "File too large (max 5MB)", http.StatusBadRequest)
					return
				}

				if !strings.HasPrefix(handler.Header.Get("Content-Type"), "image/") {
					log.Printf("Invalid file type: %s", handler.Header.Get("Content-Type"))
					http.Error(w, "Invalid file type", http.StatusBadRequest)
					return
				}

				profilePicture, err = uploadFile(file, handler, userID, "uploads")
				if err != nil {
					log.Printf("Error uploading file: %v", err)
					http.Error(w, "Failed to save profile picture", http.StatusInternalServerError)
					return
				}
			}
		}

		// Handle birth date
		birthDateStr := r.FormValue("birthDate")
		var formattedBirthDate *string
		var calculatedAge *int
		if birthDateStr != "" {
			parsedDate, err := time.Parse("02/01/2006", birthDateStr)
			if err != nil {
				log.Printf("Error parsing birth date: %v", err)
				http.Error(w, "Invalid date format. Use DD/MM/YYYY", http.StatusBadRequest)
				return
			}
			formatted := parsedDate.Format("2006-01-02")
			formattedBirthDate = &formatted

			currentYear := time.Now().Year()
			birthYear := parsedDate.Year()
			age := currentYear - birthYear
			if time.Now().Before(parsedDate.AddDate(age, 0, 0)) {
				age--
			}
			calculatedAge = &age
		}

		// Parse arrays
		var interestsArray pq.StringArray
		if interests := r.FormValue("interests"); interests != "" {
			if err := json.Unmarshal([]byte(interests), &interestsArray); err != nil {
				log.Printf("Error parsing interests: %v", err)
				http.Error(w, "Invalid interests format", http.StatusBadRequest)
				return
			}
		}

		var golangProjectsArray pq.StringArray
		if golangProjects := r.FormValue("golangProjects"); golangProjects != "" {
			if err := json.Unmarshal([]byte(golangProjects), &golangProjectsArray); err != nil {
				log.Printf("Error parsing golang projects: %v", err)
				http.Error(w, "Invalid golang projects format", http.StatusBadRequest)
				return
			}
		}

		var javascriptProjectsArray pq.StringArray
		if javascriptProjects := r.FormValue("javascriptProjects"); javascriptProjects != "" {
			if err := json.Unmarshal([]byte(javascriptProjects), &javascriptProjectsArray); err != nil {
				log.Printf("Error parsing javascript projects: %v", err)
				http.Error(w, "Invalid javascript projects format", http.StatusBadRequest)
				return
			}
		}

		query := `
			UPDATE profile 
			SET first_name = $1, 
				last_name = $2, 
				birth_date = $3, 
				age = $4, 
				gender = $5, 
				biography = $6, 
				location_city = $7, 
				interests = $8, 
				security_question = $9, 
				golang_projects = $10, 
				javascript_projects = $11, 
				discord = $12, 
				my_projects = $13
			WHERE user_id = $14
		`

		_, err := db.Pool.Exec(query,
			r.FormValue("firstName"),
			r.FormValue("lastName"),
			formattedBirthDate,
			calculatedAge,
			r.FormValue("gender"),
			r.FormValue("biography"),
			r.FormValue("locationCity"),
			interestsArray,
			r.FormValue("securityQuestion"),
			golangProjectsArray,
			javascriptProjectsArray,
			r.FormValue("discord"),
			r.FormValue("myprojects"),
			userID)

		if err != nil {
			log.Printf("Error updating profile: %v", err)
			http.Error(w, "Failed to update profile", http.StatusInternalServerError)
			return
		}

		if profilePicture != "" {
			_, err = db.Pool.Exec(`
				UPDATE profile 
				SET profile_picture = $1 
				WHERE user_id = $2
			`, profilePicture, userID)
			if err != nil {
				log.Printf("Error updating profile picture: %v", err)
				http.Error(w, "Failed to update profile picture", http.StatusInternalServerError)
				return
			}
		} else if removeProfilePicture {
			_, err = db.Pool.Exec(`
				UPDATE profile
				SET profile_picture = NULL
				WHERE user_id = $1 
			`, userID)
			if err != nil {
				log.Printf("Error removing profile picture: %v", err)
				http.Error(w, "Failed to remove profile picture", http.StatusInternalServerError)
				return
			}
		}

		//log.Printf("Discord value received: %s", r.FormValue("discord"))

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated successfully"})
	}
}

func uploadFile(file io.Reader, handler *multipart.FileHeader, userID int, uploadDir string) (string, error) {
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			return "", fmt.Errorf("failed to create upload directory: %v", err)
		}
	}

	filename := fmt.Sprintf("%d_%s", userID, handler.Filename)
	filePath := fmt.Sprintf("%s/%s", uploadDir, filename)

	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	return filename, nil
}
