/*import React from "react";
import { User, MessageCircle } from "lucide-react";
import { ProfileFormState } from "./types";

interface ProfileCardProps {
  profile: ProfileFormState;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-[#272735] rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          {profile.profilePicture ? (
            <img
              src={`http://localhost:8080/${profile.profilePicture}`}
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 bg-purple-400 rounded-full flex items-center justify-center">
              <User size={48} className="text-[#1a1b26]" />
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-white mb-2 text-center">
          {profile.firstName} {profile.lastName}
        </h2>

        <div className="space-y-3 text-gray-300 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">Age:</span>
            <span>{profile.age}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">Location:</span>
            <span>{profile.locationCity}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-purple-400">Language/task:</span>
            <div className="flex flex-wrap gap-2">
              {profile.interests?.map((interest: string, index: number) => (
                <span key={index} className="bg-purple-500 text-white px-2 py-1 rounded-lg">
                  {interest}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-purple-400">Bio:</span>
            <p className="text-sm line-clamp-3">{profile.biography}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">Max Distance:</span>
            <span>{profile.maxDistancePreference} km</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
            <User size={18} />
            Friend
          </button>
          <button className="flex-1 border border-purple-500 text-purple-500 px-4 py-2 rounded-lg hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-2">
            <MessageCircle size={18} />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;*/
