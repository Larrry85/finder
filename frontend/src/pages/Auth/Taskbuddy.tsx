import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { LoadingSpinner } from "../../components/Taskbuddy/LoadingSpinner";
import { PageHeader } from "../../components/Taskbuddy/PageHeader";
import { TaskbuddyGrid } from "../../components/Taskbuddy/TaskBuddyGrid";
import { TaskbuddyMatch } from "../../components/Taskbuddy/types";

const Taskbuddy: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<TaskbuddyMatch[]>([]);
  const [sentRequests, setSentRequests] = useState<TaskbuddyMatch[]>([]);
  const [friends, setFriends] = useState<TaskbuddyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  /*const [currentFriend, setCurrentFriend] = useState<{
    senderId: number;
    receiverId: number;
  } | null>(null);*/
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    return localToken || sessionToken;
  }, []);

  const checkAuth = useCallback(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return false;
    }
    return token;
  }, [getToken, navigate]);

  const fetchFriendRequests = async () => {
    const token = checkAuth();
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/friendrequests", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setPendingRequests(data.pendingRequests || []);
      setSentRequests(data.sentRequests || []);
      setFriends(data.friends || []);
      //console.log("Fetched friend requests:", data);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  useEffect(() => {
    const token = checkAuth();
    if (!token) return;

    setLoading(true);
    fetchFriendRequests().finally(() => setLoading(false));
  }, [checkAuth]);

  const handleAccept = async (match: TaskbuddyMatch) => {
    const token = checkAuth();
    if (!token) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/acceptfriend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          senderId: match.senderId,
          receiverId: match.receiverId,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      if (data.status === "success") {
       /* console.log(
          `Accepted friend request: senderId=${match.senderId}, receiverId=${match.receiverId}`
        );
        setCurrentFriend({
          senderId: match.senderId,
          receiverId: match.receiverId,
        });*/
        await fetchFriendRequests();
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request. Please try again.");
    }
  };

  const handleRemove = async (match: TaskbuddyMatch) => {
    const token = checkAuth();
    if (!token) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/");
      return;
    }

    try {
      const requestData = {
        senderId: match.senderId,
        receiverId: match.receiverId,
      };

      //console.log("Removing profile with data:", requestData);

      const response = await fetch("http://localhost:8080/api/unfriendbuddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Remove profile error response:", errorText);
        throw new Error(`Failed to remove profile: ${errorText}`);
      }

      const data = await response.json();
      if (data.status === "success") {
        setSentRequests((prev) => prev.filter((req) => req.id !== match.id));
        setPendingRequests((prev) => prev.filter((req) => req.id !== match.id));
        setFriends((prev) => prev.filter((friend) => friend.id !== match.id));
        await fetchFriendRequests();
      }
    } catch (error) {
      console.error("Error removing profile:", error);
      alert("Failed to remove profile. Please try again.");
    }
  };

  const handleViewProfile = (match: TaskbuddyMatch) => {
    const userId = parseInt(localStorage.getItem("userId") || "0", 10);
    const friendId =
      userId === match.senderId ? match.receiverId : match.senderId;
    navigate(`/profile/${friendId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#1a1b26]">
        <div className="hidden md:block md:w-64 bg-[#1a1b26]">
          <Navbar />
        </div>
        <div className="md:hidden w-full bg-[#1a1b26]">
          <Navbar />
        </div>
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#1a1b26]">
      <div className="hidden md:block md:w-64 bg-[#1a1b26]">
        <Navbar />
      </div>
      <div className="md:hidden w-full bg-[#1a1b26]">
        <Navbar />
      </div>
      <div className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          <PageHeader
            title="Your Task Buddies"
            subtitle="Find your perfect teammate for your next coding challenge"
          />

          <section>
            <h2 className="text-xl md:text-2xl font-bold text-purple-400 mb-3 md:mb-4">
              Pending Friend Requests
            </h2>
            {pendingRequests.length > 0 ? (
              <TaskbuddyGrid
                matches={pendingRequests}
                status="pending"
                onAccept={handleAccept}
                onRemove={handleRemove}
              />
            ) : (
              <p className="text-gray-400 text-sm md:text-base">
                No pending friend requests
              </p>
            )}
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold text-purple-400 mb-3 md:mb-4">
              Sent Friend Requests
            </h2>
            {sentRequests.length > 0 ? (
              <TaskbuddyGrid
                matches={sentRequests}
                status="sent"
                onRemove={handleRemove}
              />
            ) : (
              <p className="text-gray-400 text-sm md:text-base">
                No sent friend requests
              </p>
            )}
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold text-purple-400 mb-3 md:mb-4">
              Your Friends
            </h2>
            {friends.length > 0 ? (
              <TaskbuddyGrid
                matches={friends}
                status="friend"
                onRemove={handleRemove}
                onClick={handleViewProfile}
              />
            ) : (
              <p className="text-gray-400 text-sm md:text-base">
                No friends yet
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Taskbuddy;
