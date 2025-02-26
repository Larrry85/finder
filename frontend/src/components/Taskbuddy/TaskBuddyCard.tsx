import React from "react";
import { UserAvatar } from "./UserAvatar";
import { UserInfo } from "./UserInfo";
import { InterestTag } from "./InterestTag";
import { ActionButtons } from "./ActionButtons";
import { TaskbuddyMatch } from "./types";

interface TaskbuddyCardProps {
  match: TaskbuddyMatch;
  status: "pending" | "sent" | "friend" | "removed";
  onAccept?: (match: TaskbuddyMatch) => void;
  onRemove?: (match: TaskbuddyMatch) => void;
}

export const TaskbuddyCard: React.FC<TaskbuddyCardProps> = ({
  match,
  status,
  onAccept,
  onRemove,
}) => {
  const imageUrl = match.profilePicture
    ? `http://localhost:8080/uploads/${match.profilePicture}`
    : null;

  return (
    <div className="bg-[#272735] rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 w-full flex flex-col">
      <div className="p-3 md:p-4 flex-grow">
        <div className="flex items-center justify-center mb-3">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-400 rounded-full overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${match.firstName} ${match.lastName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "";
                }}
              />
            ) : (
              <UserAvatar size="md" />
            )}
          </div>
        </div>

        <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 text-center">
          {match.firstName} {match.lastName}
        </h2>

        <div className="space-y-3 mb-4 md:mb-6">
          <UserInfo
            locationCity={match.locationCity}
            age={match.age}
            projects={[
              ...(match.golangProjects || []),
              ...(match.javascriptProjects || []),
            ]}
          />
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {match.interests?.map((interest, index) => (
              <InterestTag key={index} interest={interest} />
            ))}
          </div>
          <p className="text-gray-400 text-xs md:text-sm italic break-words">
            "{match.biography}"
          </p>
        </div>
      </div>

      <div className="p-3 md:p-4 mt-auto">
        <ActionButtons
          match={match}
          status={status}
          onAccept={onAccept}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};

export default TaskbuddyCard;
