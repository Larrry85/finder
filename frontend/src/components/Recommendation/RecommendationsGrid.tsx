import React from "react";
import { RecommendationCard } from "./RecommendationCard";
import { Recommendation } from "./types";

interface RecommendationsGridProps {
  recommendations: Recommendation[];
  onFriend: (recommendation: Recommendation) => void;
  onRemove: (recommendation: Recommendation) => void; // Add onRemove prop
}

export const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({
  recommendations,
  onFriend,
  onRemove,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 max-w-[2000px] mx-auto">
    {recommendations.map((recommendation) => (
      <RecommendationCard
        key={recommendation.id}
        recommendation={recommendation}
        onFriend={onFriend}
        onRemove={onRemove}
      />
    ))}
  </div>
);
