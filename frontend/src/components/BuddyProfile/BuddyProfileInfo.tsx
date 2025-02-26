import { UserProfileCard } from "./types";
import { MapPin, Calendar, User, Star } from "lucide-react";
import { InterestTag } from "./InterestTag";
import { InfoRow } from "./InfoRow";
import { UserAvatar } from "./UserAvatar";
import { FaDiscord, FaLink } from "react-icons/fa";

export const BuddyProfileInfo: React.FC<{
  buddy: UserProfileCard;
  onStartChat: () => void;
  onRemove: () => void;
}> = ({ buddy }) => {
  const imageUrl = buddy.profilePicture
    ? `http://localhost:8080/uploads/${buddy.profilePicture}`
    : null;

  return (
    <div className="w-full">
      <div className="p-4 md:p-6">
        <div className="relative">
          <div className="flex items-center justify-center mb-6 md:mb-8">
            <div className="relative w-32 h-32 md:w-48 md:h-48 bg-purple-400 rounded-full overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${buddy.firstName} ${buddy.lastName}'s profile`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "";
                  }}
                />
              ) : (
                <UserAvatar size="lg" />
              )}
              <div className="absolute bottom-0 right-0 w-4 h-4 md:w-6 md:h-6 bg-green-500 rounded-full border-4 border-[#272735]" />
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 text-center">
            {buddy.firstName} {buddy.lastName}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            <InfoRow
              icon={<MapPin size={18} />}
              label="Location"
              value={buddy.locationCity}
            />
            <InfoRow
              icon={<Calendar size={18} />}
              label="Age"
              value={`${buddy.age} years`}
            />
            <InfoRow
              icon={<User size={18} />}
              label="Gender"
              value={buddy.gender}
            />
            <InfoRow
              icon={<FaDiscord size={18} />}
              label="Discord"
              value={buddy.discord}
            />
            <InfoRow
              icon={<Star size={18} />}
              label="Tasks"
              value={`${buddy.golangProjects?.length || 0} Golang, ${
                buddy.javascriptProjects?.length || 0
              } Javascript`}
            />
            <InfoRow
              icon={<FaLink size={18} />}
              label="My Projects"
              value={
                buddy.myprojects ? (
                  <a
                    href={buddy.myprojects}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm md:text-base break-words"
                  >
                    {buddy.myprojects}
                  </a>
                ) : (
                  "No link provided"
                )
              }
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8">
            {buddy.golangProjects && buddy.golangProjects.length > 0 && (
              <div className="flex-1">
                <h3 className="text-purple-400 font-medium mb-2 text-sm md:text-base">
                  Golang Tasks
                </h3>
                <ul className="text-gray-300 text-xs md:text-sm list-disc pl-6">
                  {buddy.golangProjects.map((project, index) => (
                    <li key={`golang-${index}`} className="mb-1">
                      {project}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {buddy.javascriptProjects &&
              buddy.javascriptProjects.length > 0 && (
                <div className="flex-1">
                  <h3 className="text-purple-400 font-medium mb-2 text-sm md:text-base">
                    JavaScript Tasks
                  </h3>
                  <ul className="text-gray-300 text-xs md:text-sm list-disc pl-6">
                    {buddy.javascriptProjects.map((project, index) => (
                      <li key={`javascript-${index}`} className="mb-1">
                        {project}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-purple-400 font-medium mb-2 text-sm md:text-base">
              Coding Skills
            </h3>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {buddy.interests?.map((interest, index) => (
                <InterestTag key={index} interest={interest} />
              ))}
            </div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm italic break-words mt-4">
                "{buddy.biography}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
