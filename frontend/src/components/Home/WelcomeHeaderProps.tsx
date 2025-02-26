interface WelcomeHeaderProps {
  firstName: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ firstName }) => {
  return (
    <div className="text-right">
      <h1 className="text-2xl lg:text-4xl font-bold text-purple-400 mb-2 lg:mb-3">
        Welcome back, {firstName}!
      </h1>
      <p className="text-gray-300 text-base lg:text-lg">
        Find your perfect teammate for your next coding challenge
      </p>
    </div>
  );
};
