import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number | undefined; // Allow number and undefined types
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  as?: "input" | "textarea" | "select";
  options?: { value: string; label: string }[];
  min?: string | number;
  rows?: number;
  readOnly?: boolean; // Add this prop
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  error,
  placeholder,
  as = "input",
  options,
  min,
  rows,
  readOnly = false, // Default to false
}) => {
  const baseClassName =
    "w-full p-3 bg-[#1a1b26] text-white border border-[#383850] rounded-lg focus:ring-2 focus:ring-[#b085f5] transition-all duration-200";

  const renderField = () => {
    if (as === "textarea") {
      return (
        <textarea
          name={name}
          value={value !== undefined ? value : ""} // Ensure value is always defined
          onChange={onChange}
          className={baseClassName}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly} // Apply readOnly prop
        />
      );
    }

    if (as === "select") {
      return (
        <select
          name={name}
          value={value !== undefined ? value : ""} // Ensure value is always defined
          onChange={onChange}
          className={baseClassName}
        >
          <option value="">{placeholder || "Select an option"}</option>
          {options?.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        name={name}
        value={value !== undefined ? value : ""} // Ensure value is always defined
        onChange={onChange}
        className={baseClassName}
        placeholder={placeholder}
        min={min}
        readOnly={readOnly} // Apply readOnly prop
      />
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-[#b085f5] text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {renderField()}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
