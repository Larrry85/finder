import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => (
  <header className="mb-8">
    <h1 className="text-3xl font-bold text-purple-400 mb-2">{title}</h1>
    <p className="text-gray-400">{subtitle}</p>
  </header>
);
