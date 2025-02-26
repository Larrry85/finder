import { RecomAvatarProps } from "./types";

export const InfoRow: React.FC<RecomAvatarProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-[#1a1b26] rounded-lg">
    <div className="text-purple-400">{icon}</div>
    <div className="flex flex-col">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  </div>
);
