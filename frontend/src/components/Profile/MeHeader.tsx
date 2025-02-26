import React from "react";
import { ChevronLeft } from "lucide-react";

interface MeHeaderProps {
  title: string;
  onBack: () => void;
}

const MeHeader: React.FC<MeHeaderProps> = ({ title, onBack }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onBack}
        className="text-white hover:text-gray-400 transition-all duration-200"
      >
        <ChevronLeft size={24} />
      </button>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div />
    </div>
  );
};

export default MeHeader;