export const BuddyLoadingCard = () => (
  <div className="animate-pulse max-w-4xl mx-auto bg-[#272735] rounded-lg p-4 md:p-8 shadow-lg">
    <div className="flex items-center justify-center mb-6 md:mb-8">
      <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#383850]" />
    </div>
    <div className="h-6 md:h-8 bg-[#383850] rounded mb-3 md:mb-4 w-1/3 mx-auto" />
    <div className="h-4 bg-[#383850] rounded mb-4 md:mb-6 w-2/3 mx-auto" />
    <div className="space-y-3 md:space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-4 bg-[#383850] rounded w-full" />
      ))}
    </div>
  </div>
);
