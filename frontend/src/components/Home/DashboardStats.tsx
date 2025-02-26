// components/Home/DashboardStats.tsx
import React from "react";
import { Users, MessageSquare, Bell, Activity } from "lucide-react";

interface DashboardStatsProps {
  onlineFriends: number;
  newMessages: number;
  newRequests: number;
  matchRate: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  onlineFriends,
  newMessages,
  newRequests,
  matchRate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-8">
      <div className="bg-gradient-to-br from-[#383850] to-[#2a2a3d] rounded-xl p-4 lg:p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-purple-400 text-base lg:text-lg font-medium">
            Online Friends
          </h3>
          <Users className="h-4 w-4 text-purple-400" />
        </div>
        <div className="text-xl lg:text-2xl font-bold text-white">
          {onlineFriends}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#383850] to-[#2a2a3d] rounded-xl p-4 lg:p-6 border border-blue-500/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-blue-400 text-base lg:text-lg font-medium">
            New Messages
          </h3>
          <MessageSquare className="h-4 w-4 text-blue-400" />
        </div>
        <div className="text-xl lg:text-2xl font-bold text-white">
          {newMessages}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#383850] to-[#2a2a3d] rounded-xl p-4 lg:p-6 border border-pink-500/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-pink-400 text-base lg:text-lg font-medium">
            Connection Requests
          </h3>
          <Bell className="h-4 w-4 text-pink-400" />
        </div>
        <div className="text-xl lg:text-2xl font-bold text-white">
          {newRequests}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#383850] to-[#2a2a3d] rounded-xl p-4 lg:p-6 border border-green-500/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-green-400 text-base lg:text-lg font-medium">
            AVG. Match Rate
          </h3>
          <Activity className="h-4 w-4 text-green-400" />
        </div>
        <div className="text-xl lg:text-2xl font-bold text-white">
          {matchRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
