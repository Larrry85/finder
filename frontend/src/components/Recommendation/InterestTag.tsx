import React from "react";

interface InterestTagProps {
  interest: string;
}

export const InterestTag: React.FC<InterestTagProps> = ({ interest }) => (
  <span className="bg-[#383850] px-2 py-1 rounded-full text-sm">
    {interest}
  </span>
);
