package database

import (
	"io"
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func ExecuteSQLFile(db *sqlx.DB, filePath string) {
	// Open the SQL file
	file, err := os.Open(filePath)
	if err != nil {
		log.Fatalf("Failed to open SQL file: %v", err)
	}
	defer file.Close() // Ensure the file is closed after reading

	// Read the SQL file
	sqlBytes, err := io.ReadAll(file)
	if err != nil {
		log.Fatalf("Failed to read SQL file: %v", err)
	}

	// Execute the SQL statements
	_, err = db.Exec(string(sqlBytes))
	if err != nil {
		log.Fatalf("Failed to execute SQL file: %v", err)
	}

	//log.Println("Executed SQL file successfully:", filePath)
}

func ConnectDB(config *Config) *DB {
	dsn := config.GetDBConnString()
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		panic(err)
	}
	return &DB{Pool: db}
}

/*
login to scheme
psql -h localhost -U koodsisu -d match -W
password:1234

look at tables TABLE
SELECT * FROM "profile";

look at schemes
\dn

quit
\q




*/
