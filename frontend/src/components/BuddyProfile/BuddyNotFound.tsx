export const BuddyNotFound: React.FC<{ onGoBack: () => void }> = ({
  onGoBack,
}) => (
  <div className="max-w-4xl mx-auto bg-[#272735] rounded-lg p-4 md:p-8 shadow-lg">
    <div className="text-center text-white">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
        Buddy Not Found
      </h2>
      <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
        This profile doesn't exist or has been removed.
      </p>
      <button
        onClick={onGoBack}
        className="bg-purple-500 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm md:text-base"
      >
        Go Back
      </button>
    </div>
  </div>
);
