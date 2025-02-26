import React from "react";

interface ActionButtonsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

const Buttons: React.FC<ActionButtonsProps> = ({
  isSubmitting,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="flex justify-end space-x-4 pt-6 border-t border-[#383850]">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 rounded-lg text-white transition-all duration-200 hover:bg-[#383850]"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`px-6 py-3 rounded-lg text-white transition-all duration-200 ${
          isSubmitting
            ? "bg-[#b085f5]/50 cursor-not-allowed"
            : "bg-[#b085f5] hover:bg-[#c49fff] hover:shadow-lg hover:scale-105"
        }`}
      >
        {isSubmitting ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

export default Buttons;