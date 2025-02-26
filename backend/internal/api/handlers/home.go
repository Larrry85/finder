package handlers

import (
	"backend/database"
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strconv"
)

// Match represents a buddy match in the system
type Match struct {
	ID              string   `json:"id"`
	Name            string   `json:"name"`
	Skills          []string `json:"skills"`
	MatchPercentage int      `json:"matchPercentage"`
	Avatar          *string  `json:"avatar"`
}

// Activity represents a user activity in the system
type Activity struct {
	ID        string `json:"id"`
	Message   string `json:"message"`
	Type      string `json:"type"`
	Timestamp string `json:"timestamp"`
}

// HomeData represents the complete data structure for the home page
type HomeData struct {
	FirstName          string     `db:"first_name" json:"firstName"`
	LastName           string     `db:"last_name" json:"lastName"`
	ProfilePicture     *string    `db:"profile_picture" json:"profilePicture"`
	NewMessages        int        `db:"new_messages" json:"newMessages"`
	NewRequests        int        `db:"new_requests" json:"newRequests"`
	NewRecommendations int        `db:"new_recommendations" json:"newRecommendations"`
	OnlineFriends      int        `json:"onlineFriends"`
	MatchRate          float64    `db:"match_rate" json:"matchRate"`
	RecentMatches      []Match    `json:"recentMatches"`
	RecentActivity     []Activity `json:"recentActivity"`
}

// calculateAverageMatchRate calculates the average match rate for a slice of matches
func calculateAverageMatchRate(matches []Match) float64 {
	if len(matches) == 0 {
		return 0.0
	}

	var total int
	var count int
	for _, match := range matches {
		if match.ID != "0" { // Skip the "No matches found" placeholder
			total += match.MatchPercentage
			count++
		}
	}

	if count == 0 {
		return 0.0
	}

	// Calculate average and round to 1 decimal place
	average := float64(total) / float64(count)
	return math.Round(average*10) / 10
}

// HomeHandler returns an http.HandlerFunc for handling home page data requests
func HomeHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, "User ID not found in context", http.StatusUnauthorized)
			return
		}

		var homeData HomeData

		// Get online friends count
		if err := getOnlineFriendsCount(db, userID, &homeData); err != nil {
			log.Printf("Error getting online friends count: %v", err)
			homeData.OnlineFriends = 0
		}

		// Get user's profile for match calculation
		userProfile, err := getUserProfile(db, userID)
		if err != nil {
			log.Printf("Error fetching user profile: %v", err)
		}

		// Get main profile data
		if err := getMainProfileData(db, userID, &homeData); err != nil {
			log.Printf("Error fetching home data: %v", err)
			http.Error(w, "Error fetching home data", http.StatusInternalServerError)
			return
		}

		// Get recent matches
		if err := getRecentMatches(db, userID, userProfile, &homeData); err != nil {
			log.Printf("Error fetching recent matches: %v", err)
			setDefaultMatches(&homeData)
		}

		// Get recent activity
		if err := getRecentActivity(db, userID, &homeData); err != nil {
			log.Printf("Error fetching recent activity: %v", err)
			setDefaultActivity(&homeData)
		}

		// Send response
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(homeData); err != nil {
			log.Printf("Error encoding response: %v", err)
			http.Error(w, "Error encoding response", http.StatusInternalServerError)
		}
	}
}

func getOnlineFriendsCount(db *database.DB, userID int, homeData *HomeData) error {
	query := `
		WITH active_friends AS (
			SELECT DISTINCT 
				CASE 
					WHEN f.sender_id = $1 THEN f.receiver_id
					ELSE f.sender_id
				END as friend_id
			FROM friends f
			WHERE (f.sender_id = $1 OR f.receiver_id = $1)
		)
		SELECT COUNT(*)
		FROM "user" u
		JOIN active_friends af ON u.id = af.friend_id
		WHERE u.is_online = true
		AND u.last_seen > NOW() - INTERVAL '10 seconds'`

	return db.Pool.QueryRow(query, userID).Scan(&homeData.OnlineFriends)
}

func getUserProfile(db *database.DB, userID int) (*DBProfile, error) {
	var profile DBProfile
	query := `
		SELECT 
			id, 
			interests, 
			location_city, 
			max_distance_preference,
			golang_projects,
			javascript_projects,
			birth_date
		FROM profile 
		WHERE user_id = $1`

	err := db.Pool.QueryRow(query, userID).Scan(
		&profile.ID,
		&profile.Interests,
		&profile.LocationCity,
		//&profile.MaxDistancePreference,
		&profile.GolangProjects,
		&profile.JavascriptProjects,
		&profile.BirthDate,
	)
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func getMainProfileData(db *database.DB, userID int, homeData *HomeData) error {
	query := `
		SELECT 
			COALESCE(p.first_name, '') AS first_name,
			COALESCE(p.last_name, '') AS last_name,
			p.profile_picture,
			p.new_messages,
			COALESCE((
				SELECT COUNT(*) 
				FROM friend_request 
				WHERE receiver_id = $1 AND status = 'pending'
			), 0) as new_requests,
			p.new_recommendations
		FROM profile p
		WHERE p.user_id = $1`

	return db.Pool.QueryRow(query, userID).Scan(
		&homeData.FirstName,
		&homeData.LastName,
		&homeData.ProfilePicture,
		&homeData.NewMessages,
		&homeData.NewRequests,
		&homeData.NewRecommendations,
	)
}

func getRecentMatches(db *database.DB, userID int, userProfile *DBProfile, homeData *HomeData) error {
	query := `
		SELECT 
			p2.id,
			p2.first_name,
			p2.last_name,
			p2.interests,
			p2.location_city,
			p2.max_distance_preference,
			p2.profile_picture,
			p2.golang_projects,
			p2.javascript_projects,
			p2.birth_date
		FROM profile p2
		JOIN friends f ON (f.sender_id = p2.user_id OR f.receiver_id = p2.user_id)
		WHERE (f.sender_id = $1 OR f.receiver_id = $1)
		AND p2.user_id != $1
		ORDER BY f.created_at DESC
		LIMIT 4`

	rows, err := db.Pool.Query(query, userID)
	if err != nil {
		return err
	}
	defer rows.Close()

	var matches []Match
	for rows.Next() {
		var profile DBProfile
		if err := rows.Scan(
			&profile.ID,
			&profile.FirstName,
			&profile.LastName,
			&profile.Interests,
			&profile.LocationCity,
			//&profile.MaxDistancePreference,
			&profile.ProfilePicture,
			&profile.GolangProjects,
			&profile.JavascriptProjects,
			&profile.BirthDate,
		); err != nil {
			log.Printf("Error scanning match profile: %v", err)
			continue
		}

		match := createMatch(&profile, userProfile)
		matches = append(matches, match)
	}

	homeData.RecentMatches = matches
	if len(matches) > 0 {
		homeData.MatchRate = calculateAverageMatchRate(matches)
	}
	return nil
}

func createMatch(profile *DBProfile, userProfile *DBProfile) Match {
	buddySettings := SearchSettingsStruct{
		Interests:             parsePostgresArray(*profile.Interests),
		LocationType:          stringValue(profile.LocationCity),
		//MaxDistancePreference: intValue(profile.MaxDistancePreference),
		GolangProjects:        convertToProjects(parsePostgresArray(*profile.GolangProjects)),
		JavascriptProjects:    convertToProjects(parsePostgresArray(*profile.JavascriptProjects)),
		BirthDate:             stringValue(profile.BirthDate),
	}

	userSettings := SearchSettingsStruct{
		Interests:             parsePostgresArray(*userProfile.Interests),
		LocationType:          stringValue(userProfile.LocationCity),
		//MaxDistancePreference: intValue(userProfile.MaxDistancePreference),
		GolangProjects:        convertToProjects(parsePostgresArray(*userProfile.GolangProjects)),
		JavascriptProjects:    convertToProjects(parsePostgresArray(*userProfile.JavascriptProjects)),
		BirthDate:             stringValue(userProfile.BirthDate),
	}

	matchPercentage := CalculateMatchPercentage(userSettings, buddySettings)

	profilePicture := ""
	if profile.ProfilePicture != nil {
		profilePicture = "/uploads/" + *profile.ProfilePicture
	}

	return Match{
		ID:              strconv.Itoa(profile.ID),
		Name:            profile.FirstName + " " + profile.LastName,
		Skills:          parsePostgresArray(*profile.Interests),
		MatchPercentage: matchPercentage,
		Avatar:          &profilePicture,
	}
}

func getRecentActivity(db *database.DB, userID int, homeData *HomeData) error {
	query := `
		WITH recent_activities AS (
			SELECT DISTINCT ON (date_trunc('second', timestamp))
				id,
				message,
				type,
				timestamp AT TIME ZONE 'UTC' AS timestamp
			FROM activity
			WHERE user_id = $1
			ORDER BY date_trunc('second', timestamp) DESC, id DESC
			LIMIT 4
		)
		SELECT COALESCE(
			json_agg(
				json_build_object(
					'id', id::text,
					'message', message,
					'type', type,
					'timestamp', timestamp
				)
			),
			'[]'
		)
		FROM recent_activities`

	var recentActivityJSON []byte
	if err := db.Pool.QueryRow(query, userID).Scan(&recentActivityJSON); err != nil {
		return err
	}

	return json.Unmarshal(recentActivityJSON, &homeData.RecentActivity)
}

func setDefaultMatches(homeData *HomeData) {
	homeData.RecentMatches = []Match{{
		ID:              "0",
		Name:            "No matches found",
		Skills:          []string{},
		MatchPercentage: 0,
		Avatar:          nil,
	}}
	homeData.MatchRate = 0.0
}

func setDefaultActivity(homeData *HomeData) {
	homeData.RecentActivity = []Activity{{
		ID:        "0",
		Message:   "No recent activity",
		Type:      "info",
		Timestamp: "",
	}}
}

// Helper functions
func stringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func intValue(i *int) int {
	if i == nil {
		return 0
	}
	return *i
}
