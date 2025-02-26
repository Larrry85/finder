import React from "react";
import { ChevronLeft } from "lucide-react";

interface BuddyHeaderProps {
  title: string;
  onBack: () => void;
}

const BuddyHeader: React.FC<BuddyHeaderProps> = ({ title, onBack }) => {
  return (
    <header className="w-full border-b border-[#383850]">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="hover:bg-[#383850] p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h1 className="text-xl font-semibold text-[#b085f5]">{title}</h1>
        </div>
      </div>
    </header>
  );
};

export default BuddyHeader;
