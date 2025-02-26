import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className="w-full py-3 px-4 bg-[#b085f5] text-white rounded-lg text-base font-medium hover:bg-[#c49fff] active:scale-[0.98] transition-all mb-5"
    >
      {children}
    </button>
  );
};
                       