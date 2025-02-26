import React, { useState, useEffect } from "react";
import { X, ChevronLeft } from "lucide-react";
import ChatInterface from "./ChatInterface";
import { markMessagesAsRead } from "./messageUtils";
import { useNavigate, useLocation } from "react-router-dom";

interface Friend {
  id: number;
  firstName: string;
  lastName: string;
  locationCity: string;
  senderId: number;
  receiverId: number;
  lastActivity: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface MessengerPanelProps {
  onClose: () => void;
}

const MessengerPanel: React.FC<MessengerPanelProps> = ({ onClose }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClose = () => {
    if (location.pathname !== "/home") {
      navigate("/home");
    } else {
      onClose();
    }
  };

  const handleBackToFriends = () => {
    setSelectedFriend(null);
  };

  const fetchOnlineStatus = async (friends: Friend[]) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token || !friends.length) return;

    const friendIds = friends.map((friend) =>
      friend.senderId === currentUserId ? friend.receiverId : friend.senderId
    );

    try {
      const statusPromises = friendIds.map(async (friendId) => {
        const response = await fetch(
          `http://localhost:8080/api/users/${friendId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch status");
        return response.json();
      });

      const statuses = await Promise.all(statusPromises);

      setFriends((prevFriends) =>
        prevFriends.map((friend, index) => ({
          ...friend,
          isOnline: statuses[index].isOnline,
          lastSeen: statuses[index].lastSeen,
        }))
      );
    } catch (error) {
      console.error("Error fetching online status:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      try {
        // Fetch current user
        const userResponse = await fetch(
          "http://localhost:8080/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!userResponse.ok) throw new Error("Failed to fetch current user");
        const userData = await userResponse.json();
        setCurrentUserId(userData.id);

        // Fetch friends
        const friendsResponse = await fetch(
          "http://localhost:8080/api/friendrequests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!friendsResponse.ok) throw new Error("Failed to fetch friends");
        const data = await friendsResponse.json();

        if (data && data.friends && Array.isArray(data.friends)) {
          setFriends(data.friends);
          // Fetch online status for all friends
          await fetchOnlineStatus(data.friends);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Set up periodic refresh for both friends and online status
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [currentUserId]);

  const handleFriendSelect = async (friend: Friend) => {
    setSelectedFriend(friend);
    if (currentUserId) {
      const friendId =
        friend.senderId === currentUserId ? friend.receiverId : friend.senderId;
      try {
        await markMessagesAsRead(friendId);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  };

  const getReceiverId = (friend: Friend): number => {
    return friend.senderId === currentUserId
      ? friend.receiverId
      : friend.senderId;
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex w-full h-full">
      {/* Friends List Panel */}
      <div
        className={`${
          isMobileView && selectedFriend ? "hidden" : "block"
        } w-full md:w-64 shrink-0 bg-[#1a1b26] border-r border-gray-700 h-full`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Messenger</h2>
          <button
            className="text-gray-400 hover:text-white"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-white mb-4">Messages</h3>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => handleFriendSelect(friend)}
                className={`cursor-pointer mb-2 ${
                  selectedFriend?.id === friend.id ? "bg-gray-700" : ""
                }`}
              >
                <div className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                      {friend.firstName && friend.firstName[0].toUpperCase()}
                    </div>
                    {/* Online/Offline indicator */}
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1b26] ${
                        friend.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-white">
                      {friend.firstName} {friend.lastName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {friend.isOnline
                        ? "Online"
                        : friend.lastSeen
                        ? `Last seen ${formatLastSeen(friend.lastSeen)}`
                        : "Offline"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-sm">No friends found</div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div
        className={`${
          isMobileView && !selectedFriend ? "hidden" : "block"
        } flex-1 h-full bg-[#1a1b26]`}
      >
        {selectedFriend && currentUserId ? (
          <div className="h-full">
            <div className="p-4 border-b border-gray-700 flex items-center gap-3">
              {isMobileView && (
                <button
                  onClick={handleBackToFriends}
                  className="text-gray-400 hover:text-white mr-2"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  {selectedFriend.firstName[0]}
                </div>
                <div
                  className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[#1a1b26] ${
                    selectedFriend.isOnline ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              </div>
              <div>
                <div className="text-white">
                  {selectedFriend.firstName} {selectedFriend.lastName}
                </div>
                <div className="text-xs text-gray-400">
                  {selectedFriend.isOnline
                    ? "Online"
                    : selectedFriend.lastSeen
                    ? `Last seen ${formatLastSeen(selectedFriend.lastSeen)}`
                    : "Offline"}
                </div>
              </div>
            </div>
            <div className="h-[calc(100%-80px)]">
              {selectedFriend && currentUserId && (
                <ChatInterface
                  key={selectedFriend.id}
                  senderId={currentUserId}
                  receiverId={getReceiverId(selectedFriend)}
                  onTypingStatusChange={setIsTyping}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerPanel;
