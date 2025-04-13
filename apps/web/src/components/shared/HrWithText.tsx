import React from "react";

type HrWithTextProps = {
    text: string;
}

function HrWithText({text}: HrWithTextProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <hr className="flex-grow border-t border-emerald-500" />
      <div className="text-sm text-gray-500 uppercase whitespace-nowrap">
        {text}
      </div>
      <hr className="flex-grow border-t border-emerald-500" />
    </div>
  );
}

export default HrWithText;
