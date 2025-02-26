// models/user.go
package models

type User struct {
	ID             int    `db:"id"`
	FirstName      string `db:"first_name"`
	LastName       string `db:"last_name"`
	BirthDate      string `db:"birth_date"`
	Gender         string `db:"gender"`
	Age            int    `db:"age"`
	LocationCity   string `db:"location_city"`
	Biography      string `db:"biography"`
	Interests      string `db:"interests"`
	ProfilePicture string `db:"profile_picture"`
	Password       string `db:"password" json:"password"`
	Email          string `db:"email" json:"email"`
}

type BuddySettings struct {
	ID                    int      `json:"id"`
	UserID                int      `json:"user_id"`
	Gender                string   `json:"gender"`
	LocationCity          string   `json:"location_city"`
	Interests             []string `json:"interests"`
	MaxDistancePreference int      `json:"max_distance_preference"`
}
