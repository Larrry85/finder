import { MeProfileCard } from "./types";
//import { useNavigate } from "react-router-dom"; // Import useNavigate
import { MapPin, Calendar, User, Star } from "lucide-react";
import { InterestTag } from "./InterestTag";
import { InfoRow } from "./MeInfoRow";
import { MeAvatar } from "./MeAvatar";
import { FaDiscord, FaLink } from "react-icons/fa";

//import BuddyHeader from "./MeHeader";

/*interface MeCardProps {
  profile: MeProfileCard;
  onBack: () => void;
}*/

export const MeCard: React.FC<{
  me: MeProfileCard;
}> = ({ me }) => {
  const imageUrl = me.profilePicture
    ? me.profilePicture.startsWith("http")
      ? me.profilePicture
      : `http://localhost:8080/uploads/${me.profilePicture}`
    : null;

  return (
    <div className="bg-[#272735] rounded-lg p-4 md:p-8 shadow-lg mb-6">
      <div className="relative">
        <div className="flex items-center justify-center mb-6 md:mb-8">
          <div className="relative w-32 h-32 md:w-48 md:h-48 bg-purple-400 rounded-full overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${me.firstName} ${me.lastName}'s profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "";
                }}
              />
            ) : (
              <MeAvatar size="lg" />
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-[#272735]" />
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 text-center">
          {me.firstName} {me.lastName}
        </h1>
        <br />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          <InfoRow
            icon={<MapPin size={20} />}
            label="Location"
            value={me.locationCity}
          />
          <InfoRow
            icon={<Calendar size={20} />}
            label="Age"
            value={`${me.age} years`}
          />
          <InfoRow icon={<User size={20} />} label="Gender" value={me.gender} />
          <InfoRow
            icon={<FaDiscord size={20} />}
            label="Discord"
            value={me.discord}
          />
          <InfoRow
            icon={<FaLink size={20} />}
            label="My Projects"
            value={
              me.myprojects ? (
                <a
                  href={me.myprojects}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {me.myprojects}
                </a>
              ) : (
                "No link provided"
              )
            }
          />
          <InfoRow
            icon={<Star size={20} />}
            label="Tasks"
            value={`${me.golangProjects?.length || 0} Golang, ${
              me.javascriptProjects?.length || 0
            } Javascript`}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8">
          {me.golangProjects && me.golangProjects.length > 0 && (
            <div className="flex-1">
              <h3 className="text-purple-400 font-medium mb-2">Golang Tasks</h3>
              <ul className="text-gray-300 text-sm list-disc pl-6">
                {me.golangProjects.map((project, index) => (
                  <li key={`golang-${index}`}>{project}</li>
                ))}
              </ul>
            </div>
          )}

          {me.javascriptProjects && me.javascriptProjects.length > 0 && (
            <div className="flex-1">
              <h3 className="text-purple-400 font-medium mb-2">
                JavaScript Tasks
              </h3>
              <ul className="text-gray-300 text-sm list-disc pl-6">
                {me.javascriptProjects.map((project, index) => (
                  <li key={`javascript-${index}`}>{project}</li> // Render project name
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="text-purple-400 font-medium mb-3">Coding Skills</h3>
          <div className="flex flex-wrap gap-2">
            {me.interests?.map((interest, index) => (
              <InterestTag key={index} interest={interest} />
            ))}
          </div>
          <div className="mt-4">
            <p className="text-gray-400 text-sm italic break-words">
              "{me.biography}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MeCard;
