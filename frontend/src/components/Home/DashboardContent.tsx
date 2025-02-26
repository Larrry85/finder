import React, { useState, useEffect } from "react";
import { DashboardContentProps } from "./types";
import {
  MessageCircle,
  UserPlus,
  Sparkles,
  User,
  Code,
  Bell,
} from "lucide-react";

const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return "";

  try {
    // Create a Date object from the timestamp
    const activityDate = new Date(timestamp);

    // Convert the activity date to UTC
    const activityUtcDate = new Date(
      activityDate.getUTCFullYear(),
      activityDate.getUTCMonth(),
      activityDate.getUTCDate(),
      activityDate.getUTCHours(),
      activityDate.getUTCMinutes(),
      activityDate.getUTCSeconds(),
      activityDate.getUTCMilliseconds()
    );

    const currentDate = new Date();

    // Get both dates in milliseconds since epoch
    const activityMs = activityUtcDate.getTime();
    const currentMs = currentDate.getTime();

    // Calculate the time difference
    const diffInMs = currentMs - activityMs;
    const diffInSeconds = Math.floor(diffInMs / 1000);

    // Handle future dates (server/client time mismatch)
    if (diffInSeconds < 0) {
      return "Just now";
    }

    // Thresholds
    const MINUTE = 60;
    const HOUR = MINUTE * 60;
    const DAY = HOUR * 24;
    const MONTH = DAY * 30;
    const YEAR = DAY * 365;

    // If the activity time is within 30 seconds
    if (diffInSeconds < 30) {
      return "Just now";
    }

    // Minutes
    if (diffInSeconds < HOUR) {
      const minutes = Math.floor(diffInSeconds / MINUTE);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    // Hours
    if (diffInSeconds < DAY) {
      const hours = Math.floor(diffInSeconds / HOUR);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    // Days
    if (diffInSeconds < MONTH) {
      const days = Math.floor(diffInSeconds / DAY);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    // Months
    if (diffInSeconds < YEAR) {
      const months = Math.floor(diffInSeconds / MONTH);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }

    // Years
    const years = Math.floor(diffInSeconds / YEAR);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "";
  }
};

export const DashboardContent: React.FC<DashboardContentProps> = ({
  recentMatches = [],
  recentActivity = [],
}) => {
  // Update timestamps every minute
  const [, setTime] = useState(Date.now());

  const sortedActivity = React.useMemo(() => {
    if (!Array.isArray(recentActivity) || recentActivity.length === 0)
      return [];

    // Remove duplicates based on timestamp and sort
    const uniqueActivities = Array.from(
      new Map(recentActivity.map((item) => [item.timestamp, item])).values()
    );

    return uniqueActivities.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
  }, [recentActivity]);

  useEffect(() => {
    // Initial update
    setTime(Date.now());

    // Update every minute
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-5 w-5 text-blue-400" />;
      case "connection":
        return <UserPlus className="h-5 w-5 text-green-400" />;
      case "match":
        return <Sparkles className="h-5 w-5 text-yellow-400" />;
      case "profile_update":
        return <Code className="h-5 w-5 text-purple-400" />;
      case "request":
        return <Bell className="h-5 w-5 text-pink-400" />;
      default:
        return <MessageCircle className="h-5 w-5 text-blue-400" />;
    }
  };

  const getActivityBackground = (type: string): string => {
    switch (type) {
      case "message":
        return "bg-blue-500/10";
      case "connection":
        return "bg-green-500/10";
      case "match":
        return "bg-yellow-500/10";
      case "profile_update":
        return "bg-purple-500/10";
      case "request":
        return "bg-pink-500/10";
      default:
        return "bg-blue-500/10";
    }
  };

  const getProfilePicture = (avatarPath: string | null): string | undefined => {
    if (!avatarPath) return undefined;

    if (avatarPath.startsWith("/uploads/")) {
      return `http://localhost:8080${avatarPath}`;
    }

    return `http://localhost:8080/uploads/${avatarPath.replace(
      /^.*[\\\/]/,
      ""
    )}`;
  };

  const formatSkills = (skills: string[] | null | undefined): string => {
    if (!skills || !Array.isArray(skills)) return "";
    return skills
      .map((skill) => skill.trim().replace(/[{}]/g, ""))
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
      {/* Recent Matches Section */}
      <div className="bg-gradient-to-br from-[#383850] to-[#2a2a3d] rounded-xl border border-purple-500/20">
        <div className="p-4 lg:p-6 border-b border-purple-500/20">
          <h2 className="text-purple-400 text-lg lg:text-xl font-bold">
            Recent Matches
          </h2>
          <p className="text-gray-400 text-xs lg:text-sm">
            Your latest potential coding partners
          </p>
        </div>
        <div className="p-4 lg:p-6">
          <div className="space-y-3 lg:space-y-4">
            {Array.isArray(recentMatches) &&
              recentMatches.map((match, index) => {
                const formattedSkills = formatSkills(match.skills);

                return (
                  <div
                    key={`match-${match.id || index}`}
                    className="flex items-center justify-between p-2 lg:p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#b085f5] flex items-center justify-center overflow-hidden">
                        {match.avatar && getProfilePicture(match.avatar) ? (
                          <img
                            src={getProfilePicture(match.avatar)}
                            alt={match.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm lg:text-base truncate">
                          {match.name}
                        </h4>
                        {formattedSkills && (
                          <p className="text-xs lg:text-sm text-gray-400 truncate">
                            {formattedSkills}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs lg:text-sm text-purple-400 font-medium ml-2">
                      {match.matchPercentage}% Match
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-gradient-to-br from-[#383850] to-[#2a2a3d] rounded-xl border border-blue-500/20">
        <div className="p-4 lg:p-6 border-b border-blue-500/20">
          <h2 className="text-blue-400 text-lg lg:text-xl font-bold">
            Recent Activity
          </h2>
          <p className="text-gray-400 text-xs lg:text-sm">
            Latest updates from your network
          </p>
        </div>
        <div className="p-4 lg:p-6">
          <div className="space-y-3 lg:space-y-4">
            {sortedActivity.length > 0 && sortedActivity[0].id !== "0" ? (
              sortedActivity.map((activity, index) => (
                <div
                  key={`activity-${activity.id || index}`}
                  className={`flex items-center space-x-3 lg:space-x-4 p-2 lg:p-3 rounded-lg ${getActivityBackground(
                    activity.type
                  )} hover:bg-opacity-20 transition-all duration-200`}
                >
                  <div
                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full ${getActivityBackground(
                      activity.type
                    )} flex items-center justify-center`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm lg:text-base truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-3 lg:space-x-4 p-2 lg:p-3 rounded-lg bg-blue-500/10">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm lg:text-base">
                    No activity yet
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
