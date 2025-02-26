import React from "react";

export const LoadingSpinner = () =>
  React.createElement(
    "div",
    {
      className: "flex-1 ml-64 bg-[#1a1b26] flex items-center justify-center",
    },
    React.createElement("div", {
      className:
        "animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent",
    })
  );
