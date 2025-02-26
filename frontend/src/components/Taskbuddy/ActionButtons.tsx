import React from "react";
import { useNavigate } from "react-router-dom";
import { User, CheckCircle, XCircle } from "lucide-react";
import { TaskbuddyMatch } from "./types";

interface ActionButtonsProps {
  match: TaskbuddyMatch;
  status: "pending" | "sent" | "friend" | "removed";
  onAccept?: (match: TaskbuddyMatch) => void;
  onRemove?: (match: TaskbuddyMatch) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  match,
  status,
  onAccept,
  onRemove,
}) => {
  const navigate = useNavigate();

  if (status === "removed") return null;

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      {status === "friend" && (
        <button
          onClick={() => navigate(`/profile/${match.id}`)}
          className="w-full bg-purple-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <User size={16} className="hidden sm:inline" />
          View Profile
        </button>
      )}

      {status === "pending" && (
        <button
          onClick={() => onAccept?.(match)}
          className="w-full bg-green-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <CheckCircle size={16} className="hidden sm:inline" />
          Accept
        </button>
      )}

      {(status === "pending" || status === "sent" || status === "friend") && (
        <button
          onClick={() => onRemove?.(match)}
          className="w-full bg-red-500/20 text-red-400 px-3 md:px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <XCircle size={16} className="hidden sm:inline" />
          Remove
        </button>
      )}
    </div>
  );
};
