import React from "react";

// Define types for the props
interface InputFieldProps {
    label: string; // The label for the input field
    type: string;  // The type of the input (e.g., "email", "password")
    placeholder: string; // Placeholder text for the input field
    className?: string; // Optional extra className for styling
  }


function InputField({ label, type, placeholder, className }: InputFieldProps) {
  return (
    <div className="flex flex-col">
      {/* Label */}
      <label className="font-medium text-sm text-gray-700">{label}</label>
      {/* Input field */}
      <input
        type={type}
        placeholder={placeholder}
        className={`border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${className}`}
      />
    </div>
  );
}

export default InputField;
