export const LoadingSpinner = () => {
  return (
    <div className="flex-1 p-4 lg:ml-64 lg:p-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-4 border-purple-400 border-t-transparent"></div>
    </div>
  );
};
