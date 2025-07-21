import React from "react";

interface PrivacyLabelProps {
  isPrivate: boolean;
}

export default function PrivacyLabel({ isPrivate }: PrivacyLabelProps) {
  return (
    <div className="text-xs px-2 py-[2px] rounded-md bg-[#1f2937] text-gray-300 flex items-center gap-1">
      {isPrivate ? (
        <>
          {/* Lock icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.03-10-9s4.477-9 10-9c1.39 0 2.717.292 3.938.825M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Private</span>
        </>
      ) : (
        <>
          {/* Globe icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m0 14v1m8-8h1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 6a6 6 0 100 12 6 6 0 000-12z"
            />
          </svg>
          <span>Public</span>
        </>
      )}
    </div>
  );
}
