package handlers

import (
    "backend/database"
    "encoding/json"
    "log"
    "net/http"
    "time"

    "github.com/lib/pq"
)

type SearchSettings struct {
    Interests          []string  `json:"interests"`
    LocationType       []string  `json:"locationType"`
    GolangProjects     []Project `json:"golangProjects"`
    JavascriptProjects []Project `json:"javascriptProjects"`
}

// SearchSettingsHandler handles both GET and POST requests for search settings
func SearchSettingsHandler(db *database.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        userID := r.Context().Value("userID").(int)

        switch r.Method {
        case "GET":
            var settings SearchSettings
            var golangProjectsJSON, javascriptProjectsJSON []byte
            err := db.Pool.QueryRow(`
                SELECT 
                    interests,
                    location_type,
                    golang_projects,
                    javascript_projects
                FROM search_settings 
                WHERE user_id = $1
            `, userID).Scan(
                pq.Array(&settings.Interests),
                pq.Array(&settings.LocationType),
                &golangProjectsJSON,
                &javascriptProjectsJSON,
            )

            if err != nil {
                log.Printf("Error retrieving search settings SEARCH: %v", err)
                settings = SearchSettings{
                    Interests:          []string{},
                    GolangProjects:     []Project{},
                    JavascriptProjects: []Project{},
                }
            } else {
                if err := json.Unmarshal(golangProjectsJSON, &settings.GolangProjects); err != nil {
                    log.Printf("Error unmarshalling Golang projects: %v", err)
                    http.Error(w, "Failed to process Golang projects", http.StatusInternalServerError)
                    return
                }

                if err := json.Unmarshal(javascriptProjectsJSON, &settings.JavascriptProjects); err != nil {
                    log.Printf("Error unmarshalling Javascript projects: %v", err)
                    http.Error(w, "Failed to process Javascript projects", http.StatusInternalServerError)
                    return
                }
            }

            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(settings)

        case "POST":
            var settings SearchSettings
            if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
                log.Printf("Error decoding request body: %v", err)
                http.Error(w, "Invalid request body", http.StatusBadRequest)
                return
            }

            golangProjectsJSON, err := json.Marshal(settings.GolangProjects)
            if err != nil {
                log.Printf("Error marshalling Golang projects: %v", err)
                http.Error(w, "Failed to process Golang projects", http.StatusInternalServerError)
                return
            }

            javascriptProjectsJSON, err := json.Marshal(settings.JavascriptProjects)
            if err != nil {
                log.Printf("Error marshalling Javascript projects: %v", err)
                http.Error(w, "Failed to process Javascript projects", http.StatusInternalServerError)
                return
            }

            _, err = db.Pool.Exec(`
                INSERT INTO search_settings (
                    user_id,
                    interests,
                    location_type,
                    golang_projects,
                    javascript_projects,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id) DO UPDATE SET
                    interests = EXCLUDED.interests,
                    location_type = EXCLUDED.location_type,
                    golang_projects = EXCLUDED.golang_projects,
                    javascript_projects = EXCLUDED.javascript_projects,
                    updated_at = EXCLUDED.updated_at
            `, userID, pq.Array(settings.Interests), pq.Array(settings.LocationType), golangProjectsJSON, javascriptProjectsJSON, time.Now())

            if err != nil {
                log.Printf("Error saving search settings: %v", err)
                http.Error(w, "Failed to save settings", http.StatusInternalServerError)
                return
            }

            w.WriteHeader(http.StatusOK)
        default:
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        }
    }
}