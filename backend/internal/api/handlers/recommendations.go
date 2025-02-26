package handlers

import (
    "backend/database"
    "encoding/json"
    "log"
    "net/http"
    "strconv"
    "strings"

    "github.com/lib/pq"
)

type DBProfile struct {
    ID                    int     `db:"id"`
    UserID                int     `db:"user_id"`
    FirstName             string  `db:"first_name"`
    LastName              string  `db:"last_name"`
    BirthDate             *string `db:"birth_date"`
    Age                   *int    `db:"age"`
    Gender                *string `db:"gender"`
    Biography             *string `db:"biography"`
    LocationCity          *string `db:"location_city"`
    Interests             *string `db:"interests"`
    ProfilePicture        *string `db:"profile_picture"`
    GolangProjects        *string `db:"golang_projects"`
    JavascriptProjects    *string `db:"javascript_projects"`
}

func RecommendationHandler(db *database.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        userID, ok := r.Context().Value("userID").(int)
        if !ok {
            http.Error(w, "User ID not found in context", http.StatusUnauthorized)
            return
        }

        // Get user's profile
        var userProfile DBProfile
        err := db.Pool.QueryRow(`
            SELECT 
                id,
                user_id,
                first_name,
                last_name,
                birth_date,
                age,
                gender,
                biography,
                location_city,
                interests,
                profile_picture,
                golang_projects,
                javascript_projects
            FROM profile
            WHERE user_id = $1
              AND first_name IS NOT NULL
              AND last_name IS NOT NULL
              AND birth_date IS NOT NULL
              AND gender IS NOT NULL
              AND location_city IS NOT NULL
        `, userID).Scan(
            &userProfile.ID,
            &userProfile.UserID,
            &userProfile.FirstName,
            &userProfile.LastName,
            &userProfile.BirthDate,
            &userProfile.Age,
            &userProfile.Gender,
            &userProfile.Biography,
            &userProfile.LocationCity,
            &userProfile.Interests,
            &userProfile.ProfilePicture,
            &userProfile.GolangProjects,
            &userProfile.JavascriptProjects,
        )
        if err != nil {
            log.Printf("Error retrieving user profile: %v", err)
            http.Error(w, "Failed to retrieve user profile", http.StatusInternalServerError)
            return
        }

        // Fetch search settings
        var settings SearchSettings
        var golangProjectsJSON, javascriptProjectsJSON []byte
        err = db.Pool.QueryRow(`
            SELECT 
                interests,
                golang_projects,
                javascript_projects
            FROM search_settings 
            WHERE user_id = $1
        `, userID).Scan(
            pq.Array(&settings.Interests),
            &golangProjectsJSON,
            &javascriptProjectsJSON,
        )
        if err != nil {
            if err.Error() == "sql: no rows in result set" {
                log.Printf("No search settings found for user %d", userID)
                settings = SearchSettings{
                    Interests:          []string{},
                    GolangProjects:     []Project{},
                    JavascriptProjects: []Project{},
                }
                } else {
                    log.Printf("Error retrieving search settings: %v", err)
                    http.Error(w, "Failed to retrieve search settings", http.StatusInternalServerError)
                    return
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

        // Base query to fetch profiles
        query := `
            SELECT 
                id,
                user_id,
                first_name,
                last_name,
                birth_date,
                age,
                gender,
                biography,
                location_city,
                interests,
                profile_picture,
                golang_projects,
                javascript_projects
            FROM profile
            WHERE user_id != $1
              AND first_name IS NOT NULL
              AND last_name IS NOT NULL
              AND birth_date IS NOT NULL
              AND gender IS NOT NULL
              AND location_city IS NOT NULL
        `

        // Add exclusions
        query += `
            AND user_id NOT IN (
                SELECT receiver_id FROM friend_request WHERE sender_id = $1 AND status = 'pending'
                UNION
                SELECT sender_id FROM friend_request WHERE receiver_id = $1 AND status = 'pending'
                UNION
                SELECT receiver_id FROM friends WHERE sender_id = $1
                UNION
                SELECT sender_id FROM friends WHERE receiver_id = $1
                UNION
                SELECT receiver_id FROM removed_profiles WHERE sender_id = $1
                UNION
                SELECT sender_id FROM removed_profiles WHERE receiver_id = $1
            )
        `

        // Fetch profiles
        var profiles []DBProfile
        err = db.Pool.Select(&profiles, query, userID)
        if err != nil {
            log.Printf("Error fetching profiles: %v", err)
            http.Error(w, "Failed to fetch profiles", http.StatusInternalServerError)
            return
        }

        // Apply matching logic
        recommendations := matchingLogicbyPercentage(userProfile, profiles)
        //log.Println("recommendations:", len(recommendations))

        // Apply search settings to recommendations
        filteredRecommendations := filterRecommendationsBySettings(recommendations, settings)
        //log.Println("filteredrecommendations:", len(filteredRecommendations))

        // If no profiles match the search criteria, return a message
        if len(filteredRecommendations) == 0 {
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusOK)
            w.Write([]byte(`{"message": "No profiles found"}`))
            return
        }

        // Log the final recommendations
        //log.Println("Final recommendations:", len(recommendations))

        // Extract IDs from the filtered recommendations
        recommendationIDs := make([]string, len(filteredRecommendations))
        for i, rec := range filteredRecommendations {
            recommendationIDs[i] = rec.ID
        }

        // Log the final recommendation IDs
        //log.Printf("Final recommendation IDs: %+v", recommendationIDs)

        w.Header().Set("Content-Type", "application/json")
        if err := json.NewEncoder(w).Encode(filteredRecommendations); err != nil {
            log.Printf("JSON encoding error: %v", err)
            http.Error(w, "Failed to encode response", http.StatusInternalServerError)
            return
        }

    }
}

func filterRecommendationsBySettings(recommendations []Recommendation, settings SearchSettings) []Recommendation {
    var filteredRecommendations []Recommendation
    for _, profile := range recommendations {
        if matchesSearchSettings(profile, settings) {
            filteredRecommendations = append(filteredRecommendations, profile)
        } else {
            //log.Printf("Profile %s did not match search settings", profile.ID)
        }
    }
    return filteredRecommendations
}

func matchesSearchSettings(profile Recommendation, settings SearchSettings) bool {
    // Check interests
    if len(settings.Interests) > 0 {
        matches := false
        //log.Printf("Checking interests for profile %s", profile.ID)
        //log.Printf("Profile interests: %v", profile.Interests)
        //log.Printf("Search settings interests: %v", settings.Interests)
        for _, interest := range settings.Interests {
            if contains(profile.Interests, interest) {
                matches = true
                break
            }
        }
        if !matches {
            //log.Printf("Profile %s did not match interests", profile.ID)
            return false
        }
    }

    // Check Golang projects
    if len(settings.GolangProjects) > 0 {
        matches := false
        //log.Printf("Checking Golang projects for profile %s", profile.ID)
        //log.Printf("Profile Golang projects: %v", profile.GolangProjects)
        //log.Printf("Search settings Golang projects: %v", settings.GolangProjects)
        for _, project := range settings.GolangProjects {
            if containsProject(profile.GolangProjects, project.Name) {
                matches = true
                break
            }
        }
        if !matches {
            //log.Printf("Profile %s did not match Golang projects", profile.ID)
            return false
        }
    }

    // Check Javascript projects
    if len(settings.JavascriptProjects) > 0 {
        matches := false
        //log.Printf("Checking Javascript projects for profile %s", profile.ID)
        //log.Printf("Profile Javascript projects: %v", profile.JavascriptProjects)
        //log.Printf("Search settings Javascript projects: %v", settings.JavascriptProjects)
        for _, project := range settings.JavascriptProjects {
            if containsProject(profile.JavascriptProjects, project.Name) {
                matches = true
                break
            }
        }
        if !matches {
            //log.Printf("Profile %s did not match Javascript projects", profile.ID)
            return false
        }
    }

    return true
}

func containsProject(projects []string, projectName string) bool {
    normalizedProjectName := normalizeProjectName(projectName)
    for _, project := range projects {
        if normalizeProjectName(project) == normalizedProjectName {
            return true
        }
    }
    return false
}

func normalizeProjectName(projectName string) string {
    if idx := strings.LastIndex(projectName, "/"); idx != -1 {
        return projectName[idx+1:]
    }
    return projectName
}

func contains(slice []string, item string) bool {
    for _, s := range slice {
        if s == item {
            return true
        }
    }
    return false
}











func RecomHandler(db *database.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        userID, ok := r.Context().Value("userID").(int)
        if !ok {
            http.Error(w, "User ID not found in context", http.StatusUnauthorized)
            return
        }

        // Get user's profile
        var userProfile DBProfile
        err := db.Pool.QueryRow(`
            SELECT 
                id,
                user_id,
                first_name,
                last_name,
                birth_date,
                age,
                gender,
                biography,
                location_city,
                interests,
                profile_picture,
                golang_projects,
                javascript_projects
            FROM profile
            WHERE user_id = $1
        `, userID).Scan(
            &userProfile.ID,
            &userProfile.UserID,
            &userProfile.FirstName,
            &userProfile.LastName,
            &userProfile.BirthDate,
            &userProfile.Age,
            &userProfile.Gender,
            &userProfile.Biography,
            &userProfile.LocationCity,
            &userProfile.Interests,
            &userProfile.ProfilePicture,
            &userProfile.GolangProjects,
            &userProfile.JavascriptProjects,
        )
        if err != nil {
            log.Printf("Error retrieving user profile: %v", err)
            http.Error(w, "Failed to retrieve user profile", http.StatusInternalServerError)
            return
        }

        // Fetch search settings
        var settings SearchSettings
        err = db.Pool.QueryRow(`
            SELECT 
                interests,
                golang_projects,
                javascript_projects
            FROM search_settings 
            WHERE user_id = $1
        `, userID).Scan(
            pq.Array(&settings.Interests),
            pq.Array(&settings.GolangProjects),
            pq.Array(&settings.JavascriptProjects),
        )


        // Base query to fetch profiles
        query := `
            SELECT 
                id,
                user_id,
                first_name,
                last_name,
                birth_date,
                age,
                gender,
                biography,
                location_city,
                interests,
                profile_picture,
                golang_projects,
                javascript_projects
            FROM profile
            WHERE user_id != $1
        `

        // Add exclusions
        query += `
            AND user_id NOT IN (
                SELECT receiver_id FROM friend_request WHERE sender_id = $1 AND status = 'pending'
                UNION
                SELECT sender_id FROM friend_request WHERE receiver_id = $1 AND status = 'pending'
                UNION
                SELECT receiver_id FROM friends WHERE sender_id = $1
                UNION
                SELECT sender_id FROM friends WHERE receiver_id = $1
                UNION
                SELECT receiver_id FROM removed_profiles WHERE sender_id = $1
                UNION
                SELECT sender_id FROM removed_profiles WHERE receiver_id = $1
            )
        `

        // Fetch profiles
        var profiles []DBProfile
        err = db.Pool.Select(&profiles, query, userID)
        if err != nil {
            log.Printf("Error fetching profiles: %v", err)
            http.Error(w, "Failed to fetch profiles", http.StatusInternalServerError)
            return
        }

        // Apply matching logic
        recommendations := matchingLogicbyPercentage(userProfile, profiles)

        // If no profiles match the search criteria, return a message
        if len(recommendations) == 0 {
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusOK)
            w.Write([]byte(`{"message": "No profiles found"}`))
            return
        }

        // Extract IDs from the filtered recommendations
        recommendationIDs := make([]int, len(recommendations))
        for i, rec := range recommendations {
            id, err := strconv.Atoi(rec.ID)
            if err != nil {
                log.Printf("Error converting ID to int: %v", err)
                http.Error(w, "Failed to convert ID to int", http.StatusInternalServerError)
                return
            }
            recommendationIDs[i] = id
        }

        // Return only the IDs
        w.Header().Set("Content-Type", "application/json")
        if err := json.NewEncoder(w).Encode(recommendationIDs); err != nil {
            log.Printf("JSON encoding error: %v", err)
            http.Error(w, "Failed to encode response", http.StatusInternalServerError)
            return
        }
    }
}
