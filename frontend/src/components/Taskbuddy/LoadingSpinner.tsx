import React from "react";

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex-1 ml-64 p-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
    </div>
  );
};
