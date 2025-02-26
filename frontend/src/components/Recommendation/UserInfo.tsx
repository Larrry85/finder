import React from "react";
import { MapPin, Calendar, CodepenIcon } from "lucide-react";

interface UserInfoProps {
  locationCity?: string;
  age?: number;
  projects?: string[];
}

export const UserInfo: React.FC<UserInfoProps> = ({
  locationCity,
  age,
  projects = [],
}) => {
  return (
    <div className="space-y-2 text-xs md:text-sm">
      {locationCity && (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-purple-400" />
          <span>{locationCity}</span>
        </div>
      )}
      {age && (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-purple-400" />
          <span>{age} years old</span>
        </div>
      )}
      {projects && projects.length > 0 && (
        <div className="flex items-start gap-2">
          <CodepenIcon size={14} className="text-purple-400 mt-1" />
          <div className="flex flex-wrap gap-1">
            {projects.map((project, index) => (
              <span
                key={index}
                className="bg-gray-700 px-2 py-0.5 rounded text-gray-300 text-xs"
              >
                {project.replace(/[{}]/g, "")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
