import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Settings } from "lucide-react";
import Navbar from "../../components/Navbar";
import { LoadingSpinner } from "../../components/Recommendation/LoadingSpinner";
import { PageHeader } from "../../components/Recommendation/PageHeader";
import { RecommendationsGrid } from "../../components/Recommendation/RecommendationsGrid";
import EnhancedBuddySettings from "../../components/SearchSettings/EnhancedBuddySettings";
import type { Recommendation } from "../../components/Recommendation/types";

interface EnhancedSearchSettings {
  interests: string[];
  golangProjects: Array<{ name: string }>;
  javascriptProjects: Array<{ name: string }>;
}

const Recommendations: React.FC = () => {
  const [view, setView] = useState<"recommendation" | "settings">("recommendation");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [profileComplete, setProfileComplete] = useState(false);
  const [connectionIds, setConnectionIds] = useState<number[]>([]);

  const defaultSettings: EnhancedSearchSettings = {
    interests: [],
    golangProjects: [],
    javascriptProjects: [],
  };

  const checkProfileSaved = async (): Promise<boolean> => {
    const token = checkAuth();
    if (!token) return false;

    try {
      const response = await fetch("http://localhost:8080/api/users/profile", {
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
        return false;
      }

      if (response.ok) {
        const profileData = await response.json();
        return !!(
          profileData.firstName &&
          profileData.lastName &&
          profileData.birthDate &&
          profileData.gender &&
          profileData.locationCity &&
          profileData.securityQuestion
        );
      }

      return false;
    } catch (error) {
      console.error("Error checking profile completeness:", error);
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const isProfileComplete = await checkProfileSaved();
      setProfileComplete(isProfileComplete); // Set profile completion state

      if (!isProfileComplete) {
        setErrorMessage("Complete your profile.");
        setLoading(false);
        return;
      }

      fetchRecommendations();
    };

    initialize();
  }, [navigate]);

  const [settings, setSettings] =
    useState<EnhancedSearchSettings>(defaultSettings);

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

  const fetchRecommendations = async () => {
    const token = checkAuth();
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/recommendation", {
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

      const text = await response.text();
      //console.log("Raw response:", text); // Log the raw response

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Error parsing JSON:", e);
        setErrorMessage("Invalid data format received");
        setRecommendations([]);
        return;
      }

      if (data.message) {
        setErrorMessage(data.message);
        setRecommendations([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Expected array of recommendations, got:", typeof data);
        setErrorMessage("Invalid data format received");
        setRecommendations([]);
        return;
      }

      const validRecommendations = data
        .map((item) => ({
          id: item.id?.toString() || "",
          userId: parseInt(item.userId) || 0,
          name: item.name || "",
          birthDate: item.birthDate || "",
          age: parseInt(item.age) || 0,
          gender: item.gender || "",
          biography: item.biography || "",
          locationCity: item.locationCity || "",
          interests: Array.isArray(item.interests) ? item.interests : [],
          profilePicture: item.profilePicture || "",
          golangProjects: Array.isArray(item.golangProjects)
            ? item.golangProjects
            : [],
          javascriptProjects: Array.isArray(item.javascriptProjects)
            ? item.javascriptProjects
            : [],
          matchPercentage: parseInt(item.matchPercentage) || 0,
          ageRangeMin: item.ageRangeMin || 0,
          ageRangeMax: item.ageRangeMax || 0,
        }))
        // Filter out any recommendations that are in connectionIds
        .filter((rec) => !connectionIds.includes(Number(rec.id)));

      setRecommendations(validRecommendations);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setErrorMessage("Failed to fetch recommendations");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    const token = checkAuth();
    if (!token) return;

    try {
      const response = await fetch(
        "http://localhost:8080/api/buddySettings",
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

      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...defaultSettings,
          ...data,
          interests: Array.isArray(data?.interests) ? data.interests : [],
          golangProjects: Array.isArray(data?.golangProjects)
            ? data.golangProjects
            : [],
          javascriptProjects: Array.isArray(data?.javascriptProjects)
            ? data.javascriptProjects
            : [],
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setSettings({
        interests: [],
        golangProjects: [],
        javascriptProjects: [],
      });
    }
  };

  useEffect(() => {
    if (view === "recommendation" && profileComplete) {
      fetchRecommendations();
    }
  }, [view, profileComplete]);

  useEffect(() => {
    fetchSettings();
  }, [checkAuth, navigate]);

  const handleSettingsChange = (newSettings: EnhancedSearchSettings) => {
    setSettings(newSettings);
    // Clear any existing error messages when settings change
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    const token = checkAuth();
    if (!token) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("http://localhost:8080/api/buddySettings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...settings,
          // Convert project arrays to the expected format
          golangProjects: settings.golangProjects.map((p) => ({
            name: p.name,
          })),
          javascriptProjects: settings.javascriptProjects.map((p) => ({
            name: p.name,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
      }

      setSuccessMessage("Settings saved successfully!");
      // Fetch new recommendations with updated settings
      await fetchRecommendations();
      setView("recommendation");
    } catch (error) {
      console.error("Error saving settings:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save settings"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFriend = async (recommendation: Recommendation) => {
    if (!recommendation?.id) return;

    const token = checkAuth();
    if (!token) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/friendbuddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          senderId: parseInt(userId, 10),
          receiverId: parseInt(recommendation.id, 10),
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (response.ok) {
        fetchRecommendations();
        setRecommendations((prev) =>
          prev.filter((rec) => rec.id !== recommendation.id)
        );
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleRemove = async (recommendation: Recommendation) => {
    if (!recommendation?.id) return;

    const token = checkAuth();
    if (!token) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/unfriendbuddy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          senderId: parseInt(userId, 10),
          receiverId: parseInt(recommendation.id, 10),
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (response.ok) {
        fetchRecommendations();
        setRecommendations((prev) =>
          prev.filter((rec) => rec.id !== recommendation.id)
        );
      }
    } catch (error) {
      console.error("Error removing buddy:", error);
      // Optionally display a message to the user
    }
  };

  const fetchConnections = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return [];

    try {
      const response = await fetch(
        "http://localhost:8080/api/recommendations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }

      const data = await response.json();

      // Parse the response data properly
      if (Array.isArray(data)) {
        return data.map((item) => Number(item.id)).filter((id) => !isNaN(id));
      } else if (typeof data === "object" && data !== null) {
        // If data is an object with numeric properties
        return Object.values(data)
          .map((item) => Number((item as any).id))
          .filter((id) => !isNaN(id));
      }

      console.error("Unexpected data format:", data);
      return [];
    } catch (error) {
      console.error("Error fetching connections:", error);
      return [];
    }
  };

  useEffect(() => {
    const getConnections = async () => {
      try {
        const ids = await fetchConnections();
        setConnectionIds(ids);

        // Use the connection IDs to filter recommendations if needed
        setRecommendations((prev) =>
          prev.filter((rec) => !ids.includes(Number(rec.id)))
        );
      } catch (error) {
        console.error("Error in getConnections:", error);
      }
    };

    getConnections();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#1a1b26]">
      {/* Sidebar - Hide on mobile, show on md and up */}
      <div className="hidden md:block md:w-64 bg-[#1a1b26]">
        <Navbar />
      </div>

      {/* Mobile navbar - Show on mobile, hide on md and up */}
      <div className="md:hidden w-full bg-[#1a1b26]">
        <Navbar />
      </div>

      <div className="flex-1">
        <div className="w-full bg-[#272735] min-h-screen">
          {view === "recommendation" ? (
            <div className="p-4 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 md:mb-8">
                <PageHeader
                  title="Recommended Buddies"
                  subtitle="Find your perfect task companion"
                />
                <button
                  onClick={() => setView("settings")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#b085f5] text-white rounded-lg hover:bg-[#9065d8] transition-colors"
                >
                  <Settings size={20} />
                  Search Settings
                </button>
              </div>
              {errorMessage && (
                <div className="p-4 mb-6 text-red-500 bg-red-100 rounded-lg">
                  {errorMessage}
                </div>
              )}
              {loading ? (
                <LoadingSpinner />
              ) : recommendations.length > 0 ? (
                <RecommendationsGrid
                  recommendations={recommendations}
                  onFriend={handleFriend}
                  onRemove={handleRemove}
                />
              ) : (
                <div className="text-center text-gray-400 mt-8">
                  No recommendations found. Try adjusting your search settings.
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="border-b border-[#383850] p-4 md:p-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-6">
                  <button
                    onClick={() => setView("recommendation")}
                    className="hover:bg-[#383850] p-2 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <h1 className="text-xl md:text-2xl font-bold text-[#b085f5]">
                    Search settings
                  </h1>
                </div>
              </div>
              <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <EnhancedBuddySettings
                  settings={settings}
                  onChange={handleSettingsChange}
                />

                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                  <button
                    onClick={() => setView("recommendation")}
                    className="w-full sm:w-auto px-6 py-2 border border-[#383850] text-white rounded-lg hover:bg-[#383850]"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2 bg-[#b085f5] text-white rounded-lg hover:bg-[#9065d8]"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>

                {successMessage && (
                  <p className="mt-4 text-green-500">{successMessage}</p>
                )}
                {errorMessage && (
                  <p className="mt-4 text-red-500">{errorMessage}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;