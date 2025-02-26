import React, { useState } from "react";
import { ProfileFormState } from "./types";

interface ActionButtonsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  currentData: ProfileFormState;
  savedData: ProfileFormState | null;
  profilePicture: File | null;
  onSubmit: () => Promise<void>;
}

// Define the required fields type to match ProfileFormState keys
type RequiredFields = Extract<
  keyof ProfileFormState,
  "firstName" | "lastName" | "securityQuestion" | "birthDate"
>;

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSubmitting,
  onCancel,
  currentData,
  savedData,
  profilePicture,
  onSubmit,
}) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    const requiredFields: RequiredFields[] = [
      "firstName",
      "lastName",
      "securityQuestion",
      "birthDate",
    ];
    return requiredFields.every(
      (field) =>
        currentData[field]?.toString().trim() !== "" &&
        currentData[field] !== undefined
    );
  };

  const hasChanges = React.useMemo(() => {
    if (profilePicture) return true;
    if (!savedData) return false;

    return Object.keys(currentData).some((key) => {
      const k = key as keyof ProfileFormState;
      return currentData[k]?.toString() !== savedData[k]?.toString();
    });
  }, [currentData, savedData, profilePicture]);

  const handleSubmit = () => {
    if (!isSubmitting && hasChanges) {
      if (!areRequiredFieldsFilled()) {
        setShowErrorMessage(true);
        setTimeout(() => {
          setShowErrorMessage(false);
        }, 3000);
        return;
      }

      onSubmit();
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };

  const getButtonStyles = () => {
    if (showSuccessMessage) {
      return "bg-green-500 hover:bg-green-600";
    }
    if (showErrorMessage) {
      return "bg-red-500 hover:bg-red-600";
    }
    if (isSubmitting || !hasChanges) {
      return "bg-[#b085f5]/50 cursor-not-allowed";
    }
    return "bg-[#b085f5] hover:bg-[#c49fff] hover:shadow-lg hover:scale-105";
  };

  return (
    <div className="flex justify-end space-x-4 border-[#383850]">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 rounded-lg text-white transition-all duration-200 hover:bg-[#383850]"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isSubmitting || !hasChanges}
        className={`px-6 py-3 rounded-lg text-white transition-all duration-200 ${getButtonStyles()}`}
      >
        {isSubmitting
          ? "Saving..."
          : showSuccessMessage
          ? "Profile saved successfully!"
          : showErrorMessage
          ? "Fill all required fields"
          : "Save Profile"}
      </button>
    </div>
  );
};

export default ActionButtons;
