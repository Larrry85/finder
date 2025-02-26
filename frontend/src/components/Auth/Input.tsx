import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, id, ...props }: InputProps) => {
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-[#b085f5]"
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#383850] rounded-lg text-white text-sm focus:outline-none focus:border-[#b085f5] focus:ring-2 focus:ring-[#b085f5] focus:ring-opacity-20 transition-colors placeholder-[#6c6c89]"
      />
    </div>
  );
};
