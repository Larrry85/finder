/*/ src/mocks/homeData.ts
import { HomeData } from "../components/Home/types";

export const mockHomeData: HomeData = {
  username: "JohnDoe",
  interests: ["React", "TypeScript"],
  newMessages: 3,
  newRequests: 2,
  newRecommendations: 1,
  activeConnections: 5,
  matchRate: "85%",
  recentMatches: [
    {
      id: "1",
      name: "JaneDoe",
      skills: ["React", "Node.js"],
      matchPercentage: 85, // Make sure this is a number, not a string
      avatar: undefined,
    },
    {
      id: "2",
      name: "MikeSmith",
      skills: ["Python", "Django"],
      matchPercentage: 75, // Make sure this is a number, not a string
      avatar: undefined,
    },
    {
      id: "3",
      name: "AnnaJohnson",
      skills: ["Vue", "GraphQL"],
      matchPercentage: 90, // Make sure this is a number, not a string
      avatar: undefined,
    },
  ],
  recentActivity: [
    {
      id: "1",
      message: "New connection request from Jane Doe",
      timestamp: "2 hours ago",
      type: "connection",
    },
    {
      id: "2",
      message: "Mike Smith sent you a message",
      timestamp: "3 hours ago",
      type: "message",
    },
    {
      id: "3",
      message: "New match found: Sarah Wilson",
      timestamp: "5 hours ago",
      type: "match",
    },
  ],
};
*/