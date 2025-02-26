// components/Home/types.ts
export interface HomeData {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  newMessages: number;
  newRequests: number;
  newRecommendations: number;
  onlineFriends: number; // Changed from activeConnections
  matchRate: number;
  recentMatches: Match[];
  recentActivity: Activity[];
}

export interface Match {
  id: string;
  name: string;
  skills: string[];
  matchPercentage: number;
  avatar: string | null;
}

export interface Activity {
  id: string;
  message: string;
  type: "message" | "connection" | "match" | "profile_update" | "request";
  timestamp: string;
  relatedUserId?: number;
}

export interface DashboardContentProps {
  recentMatches: Match[];
  recentActivity: Activity[];
}
