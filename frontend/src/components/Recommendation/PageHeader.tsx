import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => (
  <header className="mb-4 md:mb-8 text-center sm:text-left">
    <h1 className="text-2xl md:text-3xl font-bold text-purple-400 mb-1 md:mb-2">
      {title}
    </h1>
    <p className="text-sm md:text-base text-gray-400">{subtitle}</p>
  </header>
);
