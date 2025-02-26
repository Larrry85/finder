import React, { useState } from "react";
import { RecomAvatar } from "./RecomAvatar";
import { User, XCircle } from "lucide-react";
import { InterestTag } from "./InterestTag";
import { Recommendation } from "./types";
import { UserInfo } from "./UserInfo";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onFriend: (recommendation: Recommendation) => void;
  onRemove: (recommendation: Recommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onFriend,
  onRemove,
}) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl =
    recommendation.profilePicture &&
    recommendation.profilePicture !== "/uploads/default-profile.jpg" &&
    recommendation.profilePicture !== ""
      ? recommendation.profilePicture.startsWith("http")
        ? recommendation.profilePicture
        : `http://localhost:8080${recommendation.profilePicture}`
      : null;

  //console.log("Recommendation:", recommendation);
  //console.log("Image URL:", imageUrl);

  return (
    <div className="bg-[#272735] rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 w-full flex flex-col">
      <div className="p-3 md:p-4 flex-grow">
        <div className="flex items-center justify-center mb-3">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-400 rounded-full overflow-hidden flex items-center justify-center">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={recommendation.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <RecomAvatar size="md" />
            )}
          </div>
        </div>

        <h2 className="text-base md:text-lg font-semibold text-white mb-2 text-center">
          {recommendation.name}
        </h2>
        <div className="space-y-2 text-gray-300 mb-4">
          <UserInfo
            locationCity={recommendation.locationCity}
            age={recommendation.age}
            projects={[
              ...(recommendation.golangProjects || []),
              ...(recommendation.javascriptProjects || []),
            ]}
          />
          <div className="flex flex-col gap-1">
            <span className="text-purple-400 text-sm">Coding Skills:</span>
            <div className="flex flex-wrap gap-1">
              {recommendation.interests?.map((skill, index) => (
                <InterestTag key={index} interest={skill} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-purple-400 text-sm">Bio:</span>
            <p className="text-xs md:text-sm line-clamp-2">
              {recommendation.biography}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-auto m-3 md:m-4">
        <button
          onClick={() => onFriend(recommendation)}
          className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-1 text-xs md:text-sm"
        >
          <User size={14} className="hidden sm:inline" />
          Friend
        </button>
        <button
          onClick={() => onRemove(recommendation)}
          className="flex-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1 text-xs md:text-sm"
        >
          <XCircle size={14} className="hidden sm:inline" />
          Remove
        </button>
      </div>
    </div>
  );
};
