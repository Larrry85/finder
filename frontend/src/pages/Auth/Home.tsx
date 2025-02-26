import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { LoadingSpinner } from "../../components/Home/LoadingSpinner";
import { WelcomeHeader } from "../../components/Home/WelcomeHeaderProps";
import { DashboardStats } from "../../components/Home/DashboardStats";
import { DashboardContent } from "../../components/Home/DashboardContent";
import { HomeData, Match, Activity } from "../../components/Home/types";
import axios from "axios";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  // Add online status update effect
  useEffect(() => {
    const updateOnlineStatus = async () => {
      const token = getToken();
      if (!token) return;

      try {
        await axios.post(
          "http://localhost:8080/api/online-status",
          { isOnline: true },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    };

    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 10000);

    const handleBeforeUnload = () => {
      const token = getToken();
      if (!token) return;

      const blob = new Blob(
        [
          JSON.stringify({
            isOnline: false,
            token: token,
          }),
        ],
        { type: "application/json" }
      );

      navigator.sendBeacon("http://localhost:8080/api/online-status", blob);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      const token = getToken();
      if (token) {
        axios
          .post(
            "http://localhost:8080/api/online-status",
            { isOnline: false },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          )
          .catch((error) => console.error("Cleanup error:", error));
      }
    };
  }, [getToken]);

  // Add polling effect for home data
  useEffect(() => {
    const fetchHomeData = async () => {
      const token = checkAuth();
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:8080/api/home", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        setHomeData(response.data);
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching home data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          navigate("/");
          return;
        }
        setErrorMessage("Error fetching home data");
        setLoading(false);
      }
    };

    fetchHomeData();
    const interval = setInterval(fetchHomeData, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [checkAuth, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#1a1b26]">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen bg-[#1a1b26]">
        <Navbar />
        <div className="flex-1 p-4 lg:ml-64 lg:p-8 flex items-center justify-center text-white">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="flex min-h-screen bg-[#1a1b26]">
        <Navbar />
        <div className="flex-1 p-4 lg:ml-64 lg:p-8 flex items-center justify-center text-white">
          Error loading data
        </div>
      </div>
    );
  }

  const defaultMatch: Match = {
    id: "0",
    name: "No matches yet",
    skills: [],
    matchPercentage: 0,
    avatar: null,
  };

  const defaultActivity: Activity = {
    id: "0",
    message: "No activity yet",
    timestamp: "",
    type: "message",
  };

  const limitedRecentMatches =
    homeData.recentMatches?.length > 0
      ? homeData.recentMatches.slice(0, 4)
      : [defaultMatch];

  return (
    <div className="flex min-h-screen bg-[#1a1b26]">
      <Navbar />
      <main className="flex-1 p-4 lg:ml-64 lg:p-8">
        <div className="bg-gradient-to-br from-[#383850] to-[#2a2a3d] rounded-xl p-4 lg:p-8 shadow-lg mb-4 lg:mb-8">
          <div className="flex items-center justify-end mt-8 lg:mt-0">
            {" "}
            {/* Added margin-top for mobile */}
            <WelcomeHeader firstName={homeData.firstName} />
          </div>
        </div>

        <DashboardStats
          onlineFriends={homeData.onlineFriends}
          newMessages={homeData.newMessages}
          newRequests={homeData.newRequests}
          matchRate={homeData.matchRate}
        />

        <DashboardContent
          recentMatches={limitedRecentMatches}
          recentActivity={
            homeData.recentActivity?.length > 0
              ? homeData.recentActivity
              : [defaultActivity]
          }
        />
      </main>
    </div>
  );
};

export default Home;
