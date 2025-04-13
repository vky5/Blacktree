import React from "react";

type ColouredDivProps = {
  children: React.ReactNode;
};

function ColouredDiv({ children }: ColouredDivProps) {
  return (
    <div className="flex gap-4 items-start p-4 border rounded-lg border-emerald">
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default ColouredDiv;
