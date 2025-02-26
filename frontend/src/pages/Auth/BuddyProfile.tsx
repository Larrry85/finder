import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { BuddyLoadingCard } from "../../components/BuddyProfile/BuddyLoadingCard";
import { BuddyNotFound } from "../../components/BuddyProfile/BuddyNotFound";
import { BuddyProfileInfo } from "../../components/BuddyProfile/BuddyProfileInfo";
import { UserProfileCard } from "../../components/BuddyProfile/types";
import BuddyHeader from "../../components/BuddyProfile/BuddyHeader"; // Update this path to match your project structure

const BuddyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [buddy, setBuddy] = useState<UserProfileCard | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const token = checkAuth();
    if (!token) return;

    //const userId = localStorage.getItem("userId");

    const fetchBuddy = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/buddyprofile/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (response.status === 400) {
          console.error("Bad request - invalid ID format");
          setBuddy(null);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Buddy not found");
        }

        const data = await response.json();
        //console.log("Fetched buddy profile data:", data);
        setBuddy(data);
      } catch (error) {
        console.error("Error fetching buddy profile:", error);
        setBuddy(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBuddy();
  }, [id, checkAuth, navigate]);

  const handleRemove = async () => {
    const token = checkAuth();
    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this buddy?"
    );

    if (confirmed) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/unfriendbuddy`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              buddyId: parseInt(id || "0", 10),
            }),
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to remove buddy");
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        navigate("/taskbuddy");
      } catch (error) {
        console.error("Error removing buddy:", error);
        alert("Failed to remove buddy. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#1a1b26]">
      <div className="hidden md:block md:w-64 bg-[#1a1b26] shrink-0">
        <Navbar />
      </div>
      <div className="md:hidden w-full bg-[#1a1b26]">
        <Navbar />
      </div>

      <main className="flex-1 w-full bg-[#272735]">
        <BuddyHeader
          title="Buddy Profile"
          onBack={() => navigate("/taskbuddy")}
        />

        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {loading ? (
            <BuddyLoadingCard />
          ) : !buddy ? (
            <BuddyNotFound onGoBack={() => navigate("/taskbuddy")} />
          ) : (
            <BuddyProfileInfo
              buddy={buddy}
              onStartChat={() => {}}
              onRemove={handleRemove}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default BuddyProfile;
