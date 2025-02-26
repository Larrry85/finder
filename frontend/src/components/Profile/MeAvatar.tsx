import React from "react";
import { User } from "lucide-react";

interface MeAvatarProps {
  size?: "sm" | "md" | "lg";
}

export const MeAvatar: React.FC<MeAvatarProps> = ({ size = "lg" }) => {
  const sizes = {
    sm: { container: "w-12 h-12", icon: 24 },
    md: { container: "w-16 h-16", icon: 32 },
    lg: { container: "w-24 h-24", icon: 48 },
  };

  return (
    <div
      className={`${sizes[size].container} bg-purple-400 rounded-full flex items-center justify-center transform transition-transform hover:rotate-12`}
    >
      <User size={sizes[size].icon} className="text-[#1a1b26]" />
    </div>
  );
};