package database

import (
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type DB struct {
	Pool *sqlx.DB
}

type BuddySettings struct {
	ID                    int       `db:"id"`
	UserID                int       `db:"user_id"`
	FirstName             string    `db:"first_name"`
	LastName              string    `db:"last_name"`
	Gender                string    `db:"gender"`
	Age                   int       `db:"age"`
	LocationCity          string    `db:"location_city"`
	Biography             string    `db:"biography"`
	Interests             []string  `db:"interests"`
	MaxDistancePreference int       `db:"max_distance_preference"`
	ProfilePicture        string    `db:"profile_picture"`
	NewMessages           int       `db:"new_messages"`
	NewRequests           int       `db:"new_requests"`
	NewRecommendations    int       `db:"new_recommendations"`
	ActiveConnections     int       `db:"active_connections"`
	MatchRate             float64   `db:"match_rate"`
	RecentMatches         []string  `db:"recent_matches"`
	RecentActivity        []string  `db:"recent_activity"`
	CreatedAt             time.Time `db:"created_at"`
	UpdatedAt             time.Time `db:"updated_at"`
}

type UserSeed struct {
	Email              string          `db:"email"`
	Password           string          `db:"password"`
	FirstName          string          `db:"first_name"`
	LastName           string          `db:"last_name"`
	BirthDate          string          `db:"birth_date"`
	Age                int             `db:"age"`
	Interests          []string        `db:"interests"`
	Location           string          `db:"location"`
	Description        string          `db:"description"`
	Gender             string          `db:"gender"`
	IsSeed             bool            `db:"is_seed"`
	GolangProjects     *pq.StringArray `db:"golang_projects"`
	JavascriptProjects *pq.StringArray `db:"javascript_projects"`
	Discord            string          `json:"discord" db:"discord"`
}

var finnishLocations = []struct {
	City string
}{
	{"Helsinki"}, {"Espoo"}, {"Vantaa"}, {"Tampere"}, {"Turku"},
	{"Oulu"}, {"Jyväskylä"}, {"Lahti"}, {"Kuopio"}, {"Pori"},
	{"Joensuu"}, {"Lappeenranta"}, {"Hämeenlinna"}, {"Vaasa"},
	{"Seinäjoki"}, {"Rovaniemi"}, {"Mikkeli"}, {"Kotka"},
	{"Kokkola"}, {"Kajaani"}, {"Lohja"}, {"Porvoo"}, {"Kouvola"},
	{"Savonlinna"}, {"Rauma"}, {"Tornio"}, {"Iisalmi"}, {"Imatra"},
	{"Kemi"}, {"Uusikaupunki"}, {"Raisio"}, {"Kempele"}, {"Ylivieska"},
	{"Hamina"}, {"Siilinjärvi"}, {"Pietarsaari"}, {"Salo"}, {"Varkaus"},
	{"Naantali"}, {"Kangasala"}, {"Raahe"}, {"Muurame"}, {"Sotkamo"},
	{"Kuusamo"}, {"Viinikkala"}, {"Oulunsalo"}, {"Keminmaa"},
	{"Kylmäkoski"}, {"Muuruvesi"}, {"Kärsämäki"}, {"Isojoki"},
	{"Alavus"}, {"Pöytyä"}, {"Hollola"}, {"Keuruu"}, {"Pudasjärvi"},
	{"Hyvinkää"}, {"Järvenpää"}, {"Kerava"}, {"Nurmijärvi"}, {"Kirkkonummi"},
	{"Sipoo"}, {"Tuusula"}, {"Vihti"}, {"Kauniainen"}, {"Orimattila"},
	{"Forssa"}, {"Lieto"}, {"Kaarina"}, {"Parainen"}, {"Eura"},
	{"Nivala"}, {"Haapajärvi"}, {"Kiuruvesi"}, {"Kauhajoki"},
	{"Kurikka"}, {"Ähtäri"}, {"Pieksämäki"}, {"Nurmes"}, {"Kitee"},
	{"Outokumpu"}, {"Lieksa"}, {"Jämsä"}, {"Virrat"}, {"Akaa"},
	{"Toijala"}, {"Valkeakoski"}, {"Orivesi"}, {"Kankaanpää"},
	{"Harjavalta"}, {"Huittinen"}, {"Ulvila"}, {"Kristiinankaupunki"},
	{"Närpiö"}, {"Maalahti"}, {"Pedersöre"}, {"Luoto"}, {"Saarijärvi"},
	{"Äänekoski"}, {"Viitasaari"}, {"Tervo"}, {"Kemijärvi"},
	{"Salla"}, {"Ranua"}, {"Posio"}, {"Inari"}, {"Sodankylä"},
	{"Enontekiö"}, {"Kittilä"}, {"Kolari"}, {"Muonio"}, {"Pello"},
	{"Ylitornio"}, {"Tervola"}, {"Savukoski"}, {"Pelkosenniemi"},
	{"Kärsämäki"}, {"Reisjärvi"}, {"Pyhäjärvi"}, {"Haapavesi"},
	{"Pyhäjoki"}, {"Siikajoki"}, {"Lumijoki"}, {"Liminka"},
	{"Tyrnävä"}, {"Rautavaara"}, {"Sonkajärvi"}, {"Lapinlahti"},
	{"Vieremä"}, {"Kaavi"}, {"Juankoski"}, {"Outokumpu"},
	{"Polvijärvi"}, {"Liperi"}, {"Kontiolahti"}, {"Ilomantsi"},
	{"Tohmajärvi"}, {"Rääkkylä"}, {"Heinävesi"}, {"Lemi"},
	{"Luumäki"}, {"Taipalsaari"}, {"Savitaipale"}, {"Lappeenranta"},
	{"Parikkala"}, {"Rautjärvi"}, {"Ruokolahti"}, {"Kouvola"},
	{"Iitti"}, {"Pyhtää"}, {"Virolahti"}, {"Miehikkälä"},
	{"Suomussalmi"}, {"Hyrynsalmi"}, {"Puolanka"}, {"Paltamo"},
	{"Vaala"}, {"Ristijärvi"}, {"Sotkamo"}, {"Kajaani"},
	{"Pielavesi"}, {"Kiuruvesi"}, {"Vieremä"}, {"Sonkajärvi"},
	{"Vesanto"}, {"Konnevesi"}, {"Uurainen"}, {"Kivijärvi"},
	{"Kannonkoski"}, {"Karstula"}, {"Kinnula"}, {"Kyyjärvi"},
	{"Kuhmoinen"}, {"Jämsä"}, {"Äänekoski"}, {"Petäjävesi"},
	{"Mänttä-Vilppula"}, {"Ruovesi"}, {"Virrat"}, {"Keitele"},
	{"Tervo"}, {"Varkaus"}, {"Leppävirta"}, {"Heinävesi"},
	{"Kuopio"}, {"Rautalampi"}, {"Lapinlahti"}, {"Siilinjärvi"},
	{"Karttula"}, {"Juankoski"}, {"Kaavi"}, {"Tuusniemi"},
	{"Outokumpu"}, {"Liperi"}, {"Polvijärvi"}, {"Kontiolahti"},
	{"Ilomantsi"}, {"Tohmajärvi"}, {"Rääkkylä"}, {"Lieksa"},
	{"Nurmes"}, {"Valtimo"}, {"Juuka"}, {"Joensuu"},
}

var GolangProjects = []struct {
	ID          string
	Name        string
	SubProjects []struct {
		ID   string
		Name string
	}
}{
	{
		ID:   "itinerary",
		Name: "itinerary",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "itinerary-prettifier", Name: "itinerary-prettifier"},
		},
	},
	{
		ID:   "art",
		Name: "art",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "art-decoder", Name: "art-decoder"},
			{ID: "art-interface", Name: "art-interface"},
		},
	},
	{
		ID:   "cars",
		Name: "cars",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "cars-viewer", Name: "cars-viewer"},
		},
	},
	{
		ID:   "stations",
		Name: "stations",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "stations-pathfinder", Name: "stations-pathfinder"},
		},
	},
	{
		ID:   "literary-lions",
		Name: "literary-lions",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "literary-lions-forum", Name: "literary-lions-forum"},
		},
	},
}

var JavascriptProjects = []struct {
	ID          string
	Name        string
	SubProjects []struct {
		ID   string
		Name string
	}
}{
	{
		ID:   "hellojs",
		Name: "hello-js",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "hello-world", Name: "hello-world"},
			{ID: "hello-123", Name: "hello-123"},
			{ID: "escape", Name: "escape"},
			{ID: "data-types", Name: "data-types"},
			{ID: "mutable-or-not", Name: "mutable-or-not"},
			{ID: "little-and-large", Name: "little-and-large"},
			{ID: "array", Name: "array"},
			{ID: "object", Name: "object"},
			{ID: "nested-object", Name: "nested-object"},
			{ID: "frozen-object", Name: "frozen-object"},
			{ID: "shallow-and-deep", Name: "shallow-and-deep"},
			{ID: "maths", Name: "maths"},
			{ID: "element-getter", Name: "element-getter"},
			{ID: "person", Name: "person"},
			{ID: "key", Name: "key"},
			{ID: "words", Name: "words"},
			{ID: "loudness", Name: "loudness"},
			{ID: "math-obj", Name: "math-obj"},
			{ID: "itself", Name: "itself"},
			{ID: "slice", Name: "slice"},
		},
	},
	{
		ID:   "realjs",
		Name: "real-js",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "ancient-history", Name: "ancient-history"},
			{ID: "got-the-time", Name: "got-the-time"},
			{ID: "array-filter", Name: "array-filter"},
			{ID: "array-map", Name: "array-map"},
			{ID: "array-reduce", Name: "array-reduce"},
			{ID: "diesel", Name: "diesel"},
			{ID: "authorized-users", Name: "authorized-users"},
			{ID: "pet-heritage", Name: "pet-heritage"},
			{ID: "geometry", Name: "geometry"},
		},
	},
	{
		ID:   "browserjs",
		Name: "browser-js",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "get-el", Name: "get-el"},
			{ID: "chess-board", Name: "chess-board"},
			{ID: "grow-and-shrink", Name: "grow-and-shrink"},
			{ID: "toggle-class", Name: "toggle-class"},
			{ID: "alpha-jail", Name: "alpha-jail"},
			{ID: "team-links", Name: "team-links"},
		},
	},
	{
		ID:   "matchme",
		Name: "match-me",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "web", Name: "web"},
			{ID: "graphql", Name: "graphql"},
		},
	},
	{
		ID:   "dot-js",
		Name: "dot-js",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "frontend-framework", Name: "frontend-framework"},
		},
	},
	{
		ID:   "web-game",
		Name: "web-game",
		SubProjects: []struct {
			ID   string
			Name string
		}{
			{ID: "multi-player", Name: "multi-player"},
			{ID: "npc", Name: "npc"},
		},
	},
}

var Discord string

var interests = []string{
	// Programming Languages
	"Python", "JavaScript", "Java", "Go", "C++", "C#", "PHP", "R", "Kotlin", "Scala",
	"TypeScript", "Ruby", "Swift", "Rust", "Dart", "Lua", "Perl", "Haskell", "MATLAB",

	// Frontend
	"React", "Vue.js", "Angular", "Svelte", "Next.js", "HTML5", "CSS3", "SASS",
	"jQuery", "Bootstrap", "Tailwind CSS", "Redux", "WebGL", "Three.js",

	// Backend & Databases
	"Node.js", "Django", "Flask", "Spring Boot", "Laravel", "ASP.NET",
	"PostgreSQL", "MongoDB", "MySQL", "Redis", "Cassandra", "Oracle", "SQLite",
	"GraphQL", "REST API", "gRPC",

	// DevOps & Cloud
	"Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "Jenkins",
	"GitLab CI", "GitHub Actions", "CircleCI", "Ansible", "Prometheus", "ELK Stack",

	// Development Practices & Tools
	"Git", "CI/CD", "TDD", "DevOps", "Agile", "Scrum", "Microservices",
	"Design Patterns", "Clean Code", "Code Review", "Unit Testing",

	// Emerging Tech & Specializations
	"Machine Learning", "Deep Learning", "AI", "Blockchain", "Data Science",
	"Big Data", "IoT", "Cloud Architecture", "Cybersecurity", "Web3",
	"Computer Vision", "Natural Language Processing", "Quantum Computing",

	// Mobile Development
	"Android", "iOS", "React Native", "Flutter", "Xamarin", "SwiftUI",

	// Game Development
	"Unity", "Unreal Engine", "Game Design", "DirectX", "OpenGL",
}

var itRoles = []string{
	"Software Developer", "Full Stack Developer", "Backend Engineer",
	"Frontend Developer", "DevOps Engineer", "System Administrator",
	"Data Engineer", "Cloud Architect", "Mobile Developer",
	"QA Engineer", "Security Engineer", "Machine Learning Engineer",
}

var experienceLevels = []string{
	"Junior", "Mid-level", "Senior", "Lead",
}

var itBackgrounds = []string{
	"Computer Science", "Software Engineering", "Information Technology",
	"Information Systems", "Data Science", "Cybersecurity",
}

var workplaceTypes = []string{
	"startup", "enterprise company", "consulting firm",
	"tech company", "IT service provider", "software house",
}

var genders = []string{
	"Male", "Female", "Other", "Unknown",
}

func hashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

func generateITBiography(fake *gofakeit.Faker, skills []string) string {
	role := itRoles[rand.Intn(len(itRoles))]
	level := experienceLevels[rand.Intn(len(experienceLevels))]
	background := itBackgrounds[rand.Intn(len(itBackgrounds))]
	workplace := workplaceTypes[rand.Intn(len(workplaceTypes))]
	yearsOfExperience := rand.Intn(10) + 1

	templates := []string{
		"%s %s with %d years of experience, specializing in %s and %s. Background in %s, currently working at a %s.",
		"Professional %s with a %s background. %d years of hands-on experience in %s. Currently focused on %s development at a %s.",
		"%s %s passionate about %s and %s. %d years of experience in the field, studied %s. Working at a %s.",
		"Tech enthusiast and %s %s with %d years in the industry. Specialized in %s and %s. %s graduate working at a %s.",
	}

	skill1 := skills[rand.Intn(len(skills))]
	skill2 := skills[rand.Intn(len(skills))]

	template := templates[rand.Intn(len(templates))]
	return fmt.Sprintf(template,
		level, role,
		yearsOfExperience,
		skill1, skill2,
		background,
		workplace,
	)
}

func toPostgresArray(arr []string) string {
	quotedStrings := make([]string, len(arr))
	for i, s := range arr {
		escaped := strings.Replace(s, `"`, `\"`, -1)
		quotedStrings[i] = fmt.Sprintf(`"%s"`, escaped)
	}
	return fmt.Sprintf("{%s}", strings.Join(quotedStrings, ","))
}

func GenerateTestUsers(count int) ([]UserSeed, error) {
	rand.Seed(time.Now().UnixNano())
	fake := gofakeit.New(time.Now().UnixNano())
	users := make([]UserSeed, count)

	// Use a constant password for all test users
	const testPassword = "password123"
	hashedPassword, err := hashPassword(testPassword)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %v", err)
	}

	for i := 0; i < count; i++ {
		numInterests := rand.Intn(4) + 2
		userInterests := make([]string, numInterests)

		usedInterests := make(map[string]bool)
		for j := 0; j < numInterests; j++ {
			for {
				interest := interests[rand.Intn(len(interests))]
				if !usedInterests[interest] {
					userInterests[j] = interest
					usedInterests[interest] = true
					break
				}
			}
		}

		location := finnishLocations[rand.Intn(len(finnishLocations))]
		itBio := generateITBiography(fake, userInterests)

		// Randomly assign Golang and JavaScript sub-projects
		numGolangProjects := rand.Intn(3) + 1
		golangProjects := make([]string, numGolangProjects)
		for j := 0; j < numGolangProjects; j++ {
			project := GolangProjects[rand.Intn(len(GolangProjects))]
			subProject := project.SubProjects[rand.Intn(len(project.SubProjects))]
			golangProjects[j] = subProject.Name
		}

		numJavascriptProjects := rand.Intn(3) + 1
		javascriptProjects := make([]string, numJavascriptProjects)
		for j := 0; j < numJavascriptProjects; j++ {
			project := JavascriptProjects[rand.Intn(len(JavascriptProjects))]
			subProject := project.SubProjects[rand.Intn(len(project.SubProjects))]
			javascriptProjects[j] = subProject.Name
		}

		users[i] = UserSeed{
			Email:              fake.Email(),
			Password:           hashedPassword,
			FirstName:          fake.FirstName(),
			LastName:           fake.LastName(),
			BirthDate:          fake.Date().Format("02/01/2006"),
			Age:                rand.Intn(42) + 18,
			Interests:          userInterests,
			Location:           location.City,
			Description:        itBio,
			Gender:             genders[rand.Intn(len(genders))],
			IsSeed:             true,
			GolangProjects:     (*pq.StringArray)(&golangProjects),
			JavascriptProjects: (*pq.StringArray)(&javascriptProjects),
			Discord:            "MyDiscordName",
		}
	}

	return users, nil
}

func (db *DB) SeedDatabase(count int) error {
	users, err := GenerateTestUsers(count)
	if err != nil {
		return err
	}

	tx, err := db.Pool.Beginx()
	if err != nil {
		return err
	}

	userQuery := `
        INSERT INTO "user" (email, password, is_seed)
        VALUES ($1, $2, $3)
        RETURNING id
    `

	profileQuery := `
        INSERT INTO "profile" (
            id,
            user_id,
            first_name, 
            last_name,
            birth_date,
            age,
            interests,
            location_city,
            biography,
            gender,
            max_distance_preference,
            profile_picture,
            is_seed,
			golang_projects,
			javascript_projects,
			discord
        ) VALUES (
            $1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        )
    `

	userStmt, err := tx.Preparex(userQuery)
	if err != nil {
		tx.Rollback()
		return err
	}

	profileStmt, err := tx.Preparex(profileQuery)
	if err != nil {
		tx.Rollback()
		return err
	}

	for _, user := range users {
		var userID int
		err = userStmt.Get(&userID, user.Email, user.Password, user.IsSeed)
		if err != nil {
			tx.Rollback()
			log.Printf("Failed to insert user: %v", err)
			return err
		}

		postgresInterests := toPostgresArray(user.Interests)

		birthDate, err := time.Parse("02/01/2006", user.BirthDate)
		if err != nil {
			tx.Rollback()
			log.Printf("Failed to parse birth date for user: %v", err)
			return err
		}

		_, err = profileStmt.Exec(
			userID,
			user.FirstName,
			user.LastName,
			birthDate.Format("2006-01-02"),
			user.Age,
			postgresInterests,
			user.Location,
			user.Description,
			user.Gender,
			50,
			"",
			true,
			user.GolangProjects,
			user.JavascriptProjects,
			user.Discord,
		)
		if err != nil {
			tx.Rollback()
			log.Printf("Failed to insert profile for user: %v", err)
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	log.Printf("Successfully seeded database with %d test users\n", count)
	return nil
}

func (db *DB) ClearDatabase() error {
	_, err := db.Pool.Exec(`DELETE FROM "profile" WHERE is_seed = true`)
	if err != nil {
		return err
	}
	_, err = db.Pool.Exec(`DELETE FROM "user" WHERE is_seed = true`)
	if err != nil {
		return err
	}
	log.Println("Successfully cleared all test users from database")
	return nil
}
