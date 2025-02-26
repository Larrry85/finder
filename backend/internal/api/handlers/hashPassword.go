package handlers

import (
	"log"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a plain text password
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return "", err
	}
	return string(hashedPassword), nil
}

// VerifyPassword compares the hashed password with the provided password
func VerifyPassword(providedPassword, storedPasswordHash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(storedPasswordHash), []byte(providedPassword))
	return err == nil
}
