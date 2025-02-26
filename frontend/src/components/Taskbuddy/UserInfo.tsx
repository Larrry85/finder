import React from "react";
import { MapPin, Calendar, Star } from "lucide-react";

interface UserInfoProps {
  locationCity: string;
  age: number;
  projects: string[];
}

export const UserInfo: React.FC<UserInfoProps> = ({
  locationCity,
  age,
  projects,
}) => (
  <div className="space-y-2 md:space-y-3">
    <div className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
      <MapPin size={14} className="text-purple-400" />
      <span>{locationCity}</span>
    </div>

    <div className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
      <Calendar size={14} className="text-purple-400" />
      <span>{`${age} years old`}</span>
    </div>

    <div className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
      <Star size={14} className="text-purple-400" />
      <p>Tasks</p>
    </div>
    <div className="flex flex-col gap-1.5 md:gap-2 text-gray-300 text-sm md:text-base">
      {projects.map((project, index) => (
        <p key={index} className="break-words">
          {project}
        </p>
      ))}
    </div>
  </div>
);
