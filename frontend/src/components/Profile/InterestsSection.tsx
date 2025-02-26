import React from "react";

interface InterestsSectionProps {
  interests: string;
  onInterestsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InterestsSection: React.FC<InterestsSectionProps> = ({
  interests,
  onInterestsChange,
}) => {
  return (
    <div className="md:col-span-2 space-y-4">
      <label className="text-[#b085f5] text-sm font-medium">Interests</label>
      <textarea
        name="interests"
        value={interests}
        onChange={onInterestsChange}
        className="w-full p-3 bg-[#1a1b26] text-white border border-[#383850] rounded-lg focus:ring-2 focus:ring-[#b085f5] transition-all duration-200"
        placeholder="Enter your interests (e.g., Photography, Hiking, Cooking...)"
        rows={4}
      />
      <p className="text-gray-400 text-sm">
        Separate multiple interests with commas
      </p>
    </div>
  );
};

export default InterestsSection;