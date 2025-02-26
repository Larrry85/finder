import React from "react";
import { Tag } from "lucide-react";

interface InterestTagProps {
  interest: string;
}

export const InterestTag: React.FC<InterestTagProps> = ({ interest }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-400/20 text-purple-400">
    <Tag size={12} className="mr-1" />
    {interest}
  </span>
);