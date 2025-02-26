package handlers

import (
	"log"
	"math"
	"sort"
	"strconv"
	"strings"
	"time"
	//"backend/database"
)

type Project struct {
	Name string `json:"name"`
}

type SearchSettingsStruct struct {
	Interests             []string  `json:"interests"`
	LocationType          string    `json:"locationType"`
	MaxDistancePreference int       `json:"maxDistancePreference"`
	GolangProjects        []Project `json:"golangProjects"`
	JavascriptProjects    []Project `json:"javascriptProjects"`
	BirthDate             string    `json:"birthDate"`
}

func matchingLogicbyPercentage(userProfile DBProfile, dbProfiles []DBProfile) []Recommendation {
	recommendations := make([]Recommendation, 0)
	for _, profile := range dbProfiles {
		// Handle NULL values by providing default values
		location := ""
		if profile.LocationCity != nil {
			location = *profile.LocationCity
		}

		interestsStr := "{}"
		if profile.Interests != nil {
			interestsStr = *profile.Interests
		}

		description := ""
		if profile.Biography != nil {
			description = *profile.Biography
		}

		gender := ""
		if profile.Gender != nil {
			gender = *profile.Gender
		}

		profilePicture := ""
		if profile.ProfilePicture != nil {
			profilePicture = "/uploads/" + *profile.ProfilePicture
		}

		// Parse the PostgreSQL array string into []string
		interestsStr = interestsStr[1 : len(interestsStr)-1] // Remove the curly braces
		var interests []string
		if interestsStr != "" {
			interests = parsePostgresArray(interestsStr)
		} else {
			interests = []string{}
		}

		var maxDistancePreference int

		golangProjectsStr := "{}"
		if profile.GolangProjects != nil {
			golangProjectsStr = *profile.GolangProjects
		}

		var golangProjects []Project
		if golangProjectsStr != "" {
			golangProjects = convertToProjects(parsePostgresArray(golangProjectsStr))
		} else {
			golangProjects = []Project{}
		}

		javascriptProjectsStr := "{}"
		if profile.JavascriptProjects != nil {
			javascriptProjectsStr = *profile.JavascriptProjects
		}

		var javascriptProjects []Project
		if javascriptProjectsStr != "" {
			javascriptProjects = convertToProjects(parsePostgresArray(javascriptProjectsStr))
		} else {
			javascriptProjects = []Project{}
		}

		age := 0
		if profile.Age != nil {
			age = *profile.Age
		}

		birthDate := ""
		if profile.BirthDate != nil {
			birthDate = *profile.BirthDate
		}

		// Calculate match percentage
		buddySettings := SearchSettingsStruct{
			Interests:             interests,
			LocationType:          location,
			MaxDistancePreference: maxDistancePreference,
			GolangProjects:        golangProjects,
			JavascriptProjects:    javascriptProjects,
			BirthDate:             birthDate,
		}


		userSettings := SearchSettingsStruct{
			Interests:             []string{},
			LocationType:          "",
			MaxDistancePreference: 0,
			GolangProjects:        []Project{},
			JavascriptProjects:    []Project{},
			BirthDate:             "",
		}

		if userProfile.Interests != nil {
			userSettings.Interests = parsePostgresArray(*userProfile.Interests)
		}
		if userProfile.LocationCity != nil {
			userSettings.LocationType = *userProfile.LocationCity
		}
		if userProfile.GolangProjects != nil {
			userSettings.GolangProjects = convertToProjects(parsePostgresArray(*userProfile.GolangProjects))
		}
		if userProfile.JavascriptProjects != nil {
			userSettings.JavascriptProjects = convertToProjects(parsePostgresArray(*userProfile.JavascriptProjects))
		}
		if userProfile.BirthDate != nil {
			userSettings.BirthDate = *userProfile.BirthDate
		}

		matchPercentage := CalculateMatchPercentage(userSettings, buddySettings)

		recommendation := Recommendation{
			ID:                    strconv.Itoa(profile.ID),
			Name:                  profile.FirstName + " " + profile.LastName,
			BirthDate:             birthDate,
			Age:                   age,
			Gender:                gender,
			Biography:             description,
			LocationCity:          location,
			Interests:             interests,
			//MaxDistancePreference: buddySettings.MaxDistancePreference,
			ProfilePicture:        profilePicture,
			MatchPercentage:       matchPercentage,
			GolangProjects:        parsePostgresArray(*profile.GolangProjects),
			JavascriptProjects:    parsePostgresArray(*profile.JavascriptProjects),
		}
		recommendations = append(recommendations, recommendation)
	}

	// Sort recommendations by match percentage
	sort.Slice(recommendations, func(i, j int) bool {
		return recommendations[i].MatchPercentage > recommendations[j].MatchPercentage
	})
	//log.Printf("recommendations after sorting: %d", len(recommendations))

	// Drop put worst recommendations, profiles under 30% match percentage
	// Filter out recommendations below 30% match percentage
	filteredRecommendations := make([]Recommendation, 0)
	for _, recommendation := range recommendations {
		if recommendation.MatchPercentage > 30 {
			filteredRecommendations = append(filteredRecommendations, recommendation)
		}
	}
	//log.Printf("recommendations after 30percent: %d", len(filteredRecommendations))

	//for i, recommendation := range filteredRecommendations {
	//log.Printf("Best Recommendations %d: ID: %s - Match Percentage: %d%%", i+1, recommendation.ID, recommendation.MatchPercentage)
	//}

	// Limit to 10 recommendations
	if len(filteredRecommendations) > 10 {
		filteredRecommendations = filteredRecommendations[:10]
	}

	return filteredRecommendations
}

// Helper function to convert []string to []Project
func convertToProjects(names []string) []Project {
	projects := make([]Project, len(names))
	for i, name := range names {
		projects[i] = Project{Name: name}
	}
	return projects
}

// Helper function to parse PostgreSQL array string
func parsePostgresArray(arrayStr string) []string {
	// Remove the curly braces
	arrayStr = strings.Trim(arrayStr, "{}")

	// Split the string by comma and clean up each element
	parts := strings.Split(arrayStr, ",")
	result := make([]string, 0, len(parts))

	for _, part := range parts {
		// Clean up the string: remove quotes and whitespace
		cleaned := strings.Trim(strings.TrimSpace(part), "\"")
		if cleaned != "" {
			result = append(result, cleaned)
		}
	}

	return result
}

func CalculateMatchPercentage(userSettings, buddySettings SearchSettingsStruct) int {
	sharedInterests := calculateSharedInterests(userSettings, buddySettings)
	locationMatching := calculateLocationMatching(userSettings, buddySettings)
	ageCompatibility := calculateAgeCompatibility(userSettings, buddySettings)
	profileCompleteness := calculateProfileCompleteness(buddySettings)
/*
	log.Printf("Shared Interests: %.2f%%", sharedInterests)
	log.Printf("Location Matching: %.2f%%", locationMatching)
	log.Printf("Age Compatibility: %.2f%%", ageCompatibility)
	log.Printf("Profile Completeness: %.2f%%", profileCompleteness)
*/
	return int(math.Round(sharedInterests*0.4 + locationMatching*0.3 + ageCompatibility*0.2 + profileCompleteness*0.1))
}

// is there shared interests or projects ?
func calculateSharedInterests(userSettings, buddySettings SearchSettingsStruct) float64 {
	sharedInterests := intersect(userSettings.Interests, buddySettings.Interests)
	sharedGolangProjects := intersectProjects(userSettings.GolangProjects, buddySettings.GolangProjects)
	sharedJavascriptProjects := intersectProjects(userSettings.JavascriptProjects, buddySettings.JavascriptProjects)

	totalShared := len(sharedInterests) + len(sharedGolangProjects) + len(sharedJavascriptProjects)
	totalPossible := len(userSettings.Interests) + len(userSettings.GolangProjects) + len(userSettings.JavascriptProjects)
	/*
	   log.Printf("User Interests: %+v", userSettings.Interests)
	   log.Printf("Buddy Interests: %+v", buddySettings.Interests)
	   log.Printf("Shared Interests: %+v", sharedInterests)
	   log.Printf("User Golang Projects: %+v", userSettings.GolangProjects)
	   log.Printf("Buddy Golang Projects: %+v", buddySettings.GolangProjects)
	   log.Printf("Shared Golang Projects: %+v", sharedGolangProjects)
	   log.Printf("User Javascript Projects: %+v", userSettings.JavascriptProjects)
	   log.Printf("Buddy Javascript Projects: %+v", buddySettings.JavascriptProjects)
	   log.Printf("Shared Javascript Projects: %+v", sharedJavascriptProjects)
	   log.Printf("Total Shared: %d, Total Possible: %d", totalShared, totalPossible)
	*/
	if totalPossible == 0 {
		return 0
	}

	return float64(totalShared) / float64(totalPossible) * 100
}

// is same city?
func calculateLocationMatching(userSettings, buddySettings SearchSettingsStruct) float64 {
	//log.Printf("User Location City: %s, Buddy Location City: %s", userSettings.LocationType, buddySettings.LocationType)
	if userSettings.LocationType == buddySettings.LocationType {
		return 100
	}
	return 0
}

// is age difference under 10 ?
func calculateAgeCompatibility(userSettings, buddySettings SearchSettingsStruct) float64 {
	userAge := calculateAge(userSettings.BirthDate)
	buddyAge := calculateAge(buddySettings.BirthDate)

	ageDifference := math.Abs(float64(userAge - buddyAge))
	//log.Printf("AgeDifference: %+v", ageDifference)
	if ageDifference > 10 {
		return 0
	}

	return (1 - ageDifference/10) * 100
}

// is the profile complited?
func calculateProfileCompleteness(buddySettings SearchSettingsStruct) float64 {
	totalFields := 3
	filledFields := 0

	if len(buddySettings.Interests) > 0 {
		filledFields++
	}
	if len(buddySettings.GolangProjects) > 0 {
		filledFields++
	}
	if len(buddySettings.JavascriptProjects) > 0 {
		filledFields++
	}

	return float64(filledFields) / float64(totalFields) * 100
}

// is same interests ?
func intersect(a, b []string) []string {
	set := make(map[string]bool)
	for _, item := range a {
		normalizedItem := strings.TrimSpace(strings.ToLower(item))
		//log.Printf("Normalized User Interest: %s", normalizedItem)
		set[normalizedItem] = true
	}

	var result []string
	for _, item := range b {
		normalizedItem := strings.TrimSpace(strings.ToLower(item))
		//log.Printf("Normalized Buddy Interest: %s", normalizedItem)
		if set[normalizedItem] {
			result = append(result, item)
		}
	}

	//log.Printf("Shared Interests: %+v", result)
	return result
}

// is same projects ?
func intersectProjects(a, b []Project) []Project {
	set := make(map[string]bool)
	for _, item := range a {
		normalizedItem := strings.TrimSpace(strings.ToLower(item.Name))
		parts := strings.Split(normalizedItem, "/")
		normalizedItem = parts[len(parts)-1] // Take the last part after splitting by "/"
		//log.Printf("Normalized User Project: %s", normalizedItem)
		set[normalizedItem] = true
	}

	var result []Project
	for _, item := range b {
		normalizedItem := strings.TrimSpace(strings.ToLower(item.Name))
		parts := strings.Split(normalizedItem, "/")
		normalizedItem = parts[len(parts)-1] // Take the last part after splitting by "/"
		//log.Printf("Normalized Buddy Project: %s", normalizedItem)
		if set[normalizedItem] {
			result = append(result, item)
		}
	}

	//log.Printf("Shared Projects: %+v", result)
	return result
}

func calculateAge(birthDate string) int {
	layout := "2006-01-02"
	if len(birthDate) > 10 {
		birthDate = birthDate[:10] // Trim the extra text
	}
	birth, err := time.Parse(layout, birthDate)
	if err != nil {
		log.Printf("Error parsing birth date: %v", err)
		return 0
	}

	today := time.Now()
	age := today.Year() - birth.Year()
	if today.YearDay() < birth.YearDay() {
		age--
	}

	return age
}
