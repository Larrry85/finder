import React from "react";
import { User } from "lucide-react";
import { TaskbuddyCard } from "./TaskBuddyCard";
import { TaskbuddyMatch } from "./types";

interface TaskbuddyGridProps {
  matches: TaskbuddyMatch[];
  status: "pending" | "sent" | "friend" | "removed";
  onAccept?: (match: TaskbuddyMatch) => void;
  onRemove?: (match: TaskbuddyMatch) => void;
  onClick?: (match: TaskbuddyMatch) => void;
}

export const TaskbuddyGrid: React.FC<TaskbuddyGridProps> = ({
  matches,
  status,
  onAccept,
  onRemove,
}) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-[#272735] rounded-lg p-4 md:p-8 text-center">
        <User size={36} className="mx-auto text-purple-400 mb-3 md:mb-4" />
        <p className="text-gray-400 text-sm md:text-base">
          No task buddies found in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {matches.map((match) => (
        <TaskbuddyCard
          key={`${match.id}-${match.senderId}-${match.receiverId}`}
          match={match}
          status={status}
          onAccept={onAccept}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default TaskbuddyGrid;
