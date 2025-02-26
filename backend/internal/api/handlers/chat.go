package handlers

import (
	"backend/database"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"golang.org/x/net/websocket"
)

type ChatMessage struct {
	ID         int    `json:"id"`
	SenderID   int    `json:"senderId"`
	ReceiverID int    `json:"receiverId"`
	Message    string `json:"message"`
	Timestamp  string `json:"timestamp"`
}

type TypingIndicator struct {
	SenderID   int  `json:"senderId"`
	ReceiverID int  `json:"receiverId"`
	IsTyping   bool `json:"isTyping"`
}

type ChatResponse struct {
	Messages []ChatMessage `json:"messages"`
	Total    int           `json:"total"`
}

// WebSocket handling for chat messages
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan ChatMessage)

// WebSocket handling for typing indicators
var typingClients = make(map[*websocket.Conn]bool)
var typingBroadcast = make(chan TypingIndicator)

func HandleConnections(ws *websocket.Conn) {
	defer func() {
		log.Println("Closing WebSocket connection")
		ws.Close()
	}()
	log.Println("Adding WebSocket connection to clients map")
	clients[ws] = true
	log.Println("New WebSocket connection established")

	for {
		var msg ChatMessage
		log.Println("Waiting to receive message from WebSocket")
		err := websocket.JSON.Receive(ws, &msg)
		if err != nil {
			log.Printf("WebSocket receive error: %v", err)
			log.Println("Removing WebSocket connection from clients map")
			delete(clients, ws)
			break
		}
		log.Printf("Received WebSocket message: %v", msg)
		log.Println("Sending message to broadcast channel")
		broadcast <- msg
	}
	log.Println("Exiting WebSocket connection handler loop")
}

func HandleMessages() {
	for {
		msg := <-broadcast
		log.Printf("Broadcasting message: %v", msg)
		for client := range clients {
			err := websocket.JSON.Send(client, msg)
			if err != nil {
				log.Printf("WebSocket send error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func HandleTypingConnections(ws *websocket.Conn) {
	defer func() {
		log.Println("Closing typing indicator WebSocket connection")
		ws.Close()
	}()

	log.Println("Adding typing indicator WebSocket connection to clients map")
	typingClients[ws] = true
	log.Println("New typing indicator WebSocket connection established")

	for {
		var indicator TypingIndicator
		err := websocket.JSON.Receive(ws, &indicator)
		if err != nil {
			//	log.Printf("Typing indicator WebSocket receive error: %v", err)
			delete(typingClients, ws)
			break
		}

		//log.Printf("Received typing indicator from user %d to user %d: isTyping=%v",
		//	indicator.SenderID, indicator.ReceiverID, indicator.IsTyping)

		typingBroadcast <- indicator
	}
}

func HandleTypingIndicators() {
	for {
		indicator := <-typingBroadcast
		// log.Printf("Broadcasting typing indicator: %+v", indicator)

		for client := range typingClients {
			// Only send typing indicators to relevant clients
			err := websocket.JSON.Send(client, indicator)
			if err != nil {
				log.Printf("Error sending typing indicator: %v", err)
				client.Close()
				delete(typingClients, client)
			}
		}
	}
}

func ChatHandler(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			var chatMessage ChatMessage
			if err := json.NewDecoder(r.Body).Decode(&chatMessage); err != nil {
				log.Printf("Error decoding request body: %v", err)
				http.Error(w, "Invalid request payload", http.StatusBadRequest)
				return
			}

			log.Printf("Received chat message: %+v", chatMessage)

			_, err := db.Pool.Exec(
				`INSERT INTO chat_message (sender_id, receiver_id, message, timestamp)
                 VALUES ($1, $2, $3, $4)`,
				chatMessage.SenderID, chatMessage.ReceiverID, chatMessage.Message, chatMessage.Timestamp,
			)
			if err != nil {
				log.Printf("Error saving chat message: %v", err)
				http.Error(w, "Failed to save chat message", http.StatusInternalServerError)
				return
			}

			//log.Printf("Chat message saved successfully: %+v", chatMessage)

			broadcast <- chatMessage

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(chatMessage)
		} else if r.Method == http.MethodGet {
			senderIDStr := r.URL.Query().Get("senderId")
			receiverIDStr := r.URL.Query().Get("receiverId")
			pageStr := r.URL.Query().Get("page")
			limitStr := r.URL.Query().Get("limit")

			if senderIDStr == "" || receiverIDStr == "" {
				log.Printf("Missing senderId or receiverId in query parameters")
				http.Error(w, "Missing senderId or receiverId", http.StatusBadRequest)
				return
			}

			senderID, err := strconv.Atoi(senderIDStr)
			if err != nil {
				log.Printf("Invalid senderId: %v", err)
				http.Error(w, "Invalid senderId", http.StatusBadRequest)
				return
			}

			receiverID, err := strconv.Atoi(receiverIDStr)
			if err != nil {
				log.Printf("Invalid receiverId: %v", err)
				http.Error(w, "Invalid receiverId", http.StatusBadRequest)
				return
			}

			page, err := strconv.Atoi(pageStr)
			if err != nil || page < 1 {
				page = 1
			}

			limit, err := strconv.Atoi(limitStr)
			if err != nil || limit < 1 {
				limit = 20
			}

			offset := (page - 1) * limit

			//log.Printf("Fetching chat messages for senderID=%d and receiverID=%d, page=%d, limit=%d",
			//	senderID, receiverID, page, limit)

			var total int
			err = db.Pool.QueryRow(
				`SELECT COUNT(*)
                 FROM chat_message
                 WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
				senderID, receiverID,
			).Scan(&total)
			if err != nil {
				log.Printf("Error retrieving total number of chat messages: %v", err)
				http.Error(w, "Failed to retrieve total number of chat messages", http.StatusInternalServerError)
				return
			}

			rows, err := db.Pool.Query(
				`SELECT id, sender_id, receiver_id, message, timestamp
                 FROM chat_message
                 WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
                 ORDER BY timestamp DESC
                 LIMIT $3 OFFSET $4`,
				senderID, receiverID, limit, offset,
			)
			if err != nil {
				log.Printf("Error retrieving chat messages: %v", err)
				http.Error(w, "Failed to retrieve chat messages", http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var chatMessages []ChatMessage
			for rows.Next() {
				var chatMessage ChatMessage
				if err := rows.Scan(&chatMessage.ID, &chatMessage.SenderID, &chatMessage.ReceiverID,
					&chatMessage.Message, &chatMessage.Timestamp); err != nil {
					log.Printf("Error scanning chat message: %v", err)
					http.Error(w, "Failed to scan chat message", http.StatusInternalServerError)
					return
				}
				chatMessages = append(chatMessages, chatMessage)
			}

			response := ChatResponse{
				Messages: chatMessages,
				Total:    total,
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)
		} else {
			log.Printf("Method not allowed: %s", r.Method)
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func MarkMessagesAsRead(db *database.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		userID := r.Context().Value("userID").(int)
		senderIDStr := r.URL.Query().Get("senderId")
		senderID, err := strconv.Atoi(senderIDStr)
		if err != nil {
			http.Error(w, "Invalid sender ID", http.StatusBadRequest)
			return
		}

		_, err = db.Pool.Exec(`
            UPDATE chat_message 
            SET is_read = true 
            WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false`,
			userID, senderID)

		if err != nil {
			log.Printf("Error marking messages as read: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
