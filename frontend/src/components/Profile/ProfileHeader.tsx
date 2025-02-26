import React from "react";
//import { ChevronLeft } from "lucide-react";

const ProfileHeader: React.FC = () => {
  return (
    <div className="border-b border-[#383850] p-6">
      <div className="flex items-center space-x-4 mb-6">

      {/*<button className="hover:bg-[#383850] p-2 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>*/}

        <h1 className="text-2xl font-bold text-[#b085f5]">Edit Profile</h1>
      </div>
    </div>
  );
};

export default ProfileHeader;
