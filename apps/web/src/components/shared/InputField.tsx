import React from "react";

// Define types for the props
interface InputFieldProps {
  label: string; // The label for the input field
  type: string; // The type of the input (e.g., "email", "password")
  placeholder: string; // Placeholder text for the input field
  className?: string; // Optional extra className for styling
  value?: string; // The current value of the input field
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Callback for handling input changes
}

function InputField({ label, type, placeholder, className, value, onChange }: InputFieldProps) {
  return (
    <div className="flex flex-col text-black">
      {/* Label */}
      <label className="font-medium text-sm">{label}</label>
      {/* Input field */}
      <input
        type={type}
        placeholder={placeholder}
        value={value} // Bind the value prop
        onChange={onChange} // Trigger the onChange callback
        className={`border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${className}`}
      />
    </div>
  );
}

export default InputField;
