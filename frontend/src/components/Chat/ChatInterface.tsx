import React, { useState, useEffect, useRef, useCallback } from "react";

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  timestamp: string;
}

export interface ChatInterfaceProps {
  senderId: number;
  receiverId: number;
  onTypingStatusChange: (isTyping: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  senderId,
  receiverId,
  onTypingStatusChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatWs = useRef<WebSocket | null>(null);
  const typingWs = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();
  const typingTimeoutRef = useRef<number>();

  const getToken = useCallback(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const connectWebSocket = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.error("No token found");
      return;
    }

    // Chat WebSocket
    if (!chatWs.current || chatWs.current.readyState === WebSocket.CLOSED) {
      chatWs.current = new WebSocket(
        `ws://localhost:8080/ws/chat?token=${token}&senderId=${senderId}&receiverId=${receiverId}`
      );

      chatWs.current.onopen = () => {
        console.log("Chat WebSocket Connected");
        setWsConnected(true);
      };

      chatWs.current.onclose = () => {
        console.log("Chat WebSocket Closed");
        setWsConnected(false);
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };

      chatWs.current.onerror = (error) => {
        console.error("Chat WebSocket Error:", error);
      };

      chatWs.current.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (
          (message.senderId === senderId &&
            message.receiverId === receiverId) ||
          (message.senderId === receiverId && message.receiverId === senderId)
        ) {
          setMessages((prev) => {
            const updated = [...prev];
            if (
              !updated.some(
                (msg) =>
                  msg.id === message.id && msg.timestamp === message.timestamp
              )
            ) {
              updated.push(message);
              updated.sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              );
            }
            return updated;
          });

          // Scroll to bottom for new messages
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight;
            }
          }, 100);

          // Scroll to bottom after updating messages
          scrollToBottom();
        }
      };
    }

    // Typing WebSocket
    if (!typingWs.current || typingWs.current.readyState === WebSocket.CLOSED) {
      typingWs.current = new WebSocket(
        `ws://localhost:8080/ws/typing?token=${token}`
      );

      typingWs.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.senderId === receiverId && data.receiverId === senderId) {
          setIsTyping(data.isTyping);
          onTypingStatusChange(data.isTyping);
        }
      };
    }
  }, [getToken, senderId, receiverId, onTypingStatusChange]);

  const fetchMessages = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No token found");

      const response = await fetch(
        `http://localhost:8080/api/chat?senderId=${senderId}&receiverId=${receiverId}&page=${page}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized error - maybe redirect to login
          console.error("Unauthorized access - token may be invalid");
          return;
        }
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      if (data && data.messages) {
        // Reverse the messages array so newest messages appear at the bottom
        const sortedMessages = [...data.messages].reverse();
        setMessages(sortedMessages);
        setTotalPages(Math.ceil(data.total / 20));

        // Only scroll to bottom if we're on the first page (most recent messages)
        if (page === 1) {
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  }, [getToken, page, senderId, receiverId]);

  useEffect(() => {
    connectWebSocket();
    fetchMessages();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (chatWs.current) {
        chatWs.current.close();
      }
      if (typingWs.current) {
        typingWs.current.close();
      }
    };
  }, [connectWebSocket, fetchMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    if (typingWs.current?.readyState === WebSocket.OPEN) {
      typingWs.current.send(
        JSON.stringify({
          senderId,
          receiverId,
          isTyping: true,
        })
      );
    }

    // Clear typing indicator after 1 second of no input
    typingTimeoutRef.current = window.setTimeout(() => {
      if (typingWs.current?.readyState === WebSocket.OPEN) {
        typingWs.current.send(
          JSON.stringify({
            senderId,
            receiverId,
            isTyping: false,
          })
        );
      }
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const token = getToken();
    if (!token) {
      console.error("No token found");
      return;
    }

    const message = {
      senderId,
      receiverId,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - token may be invalid");
          return;
        }
        throw new Error("Failed to send message");
      }

      setNewMessage("");
      // Refresh messages after sending
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1b26]">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3">
        {messages.map((msg) => (
          <div
            key={msg.id || `${msg.senderId}-${msg.timestamp}`}
            className={`py-1 flex ${msg.senderId === senderId ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`rounded-2xl px-3 py-2 max-w-[75%] ${msg.senderId === senderId ? "bg-purple-600" : "bg-[#383850]"
                }`}
            >
              <p className="text-sm text-white break-all">{msg.message}</p>
              <p className="text-[10px] text-gray-300 text-right mt-1">
              {new Date(msg.timestamp).toLocaleDateString('en-GB', {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}{" "}
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="py-1 flex justify-start">
            <div className="bg-[#383850] rounded-2xl px-3 py-2">
              <p className="text-sm text-gray-400">typing...</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-2 py-2 border-t border-[#383850] bg-[#1a1b26]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="p-1 text-gray-400 rounded text-sm w-8 h-8 flex items-center justify-center hover:bg-[#383850] disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="text-gray-400 text-sm min-w-[20px] text-center">
            {page}
          </span>
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="p-1 text-gray-400 rounded text-sm w-8 h-8 flex items-center justify-center hover:bg-[#383850] disabled:opacity-50"
          >
            {">"}
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message"
            className="flex-1 bg-[#272735] text-white text-sm px-3 py-2 rounded-lg border border-[#383850] focus:outline-none focus:border-purple-500 mx-1"
          />
          <button
            onClick={handleSendMessage}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatInterface);
