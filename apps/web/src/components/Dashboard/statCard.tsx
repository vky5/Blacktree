import React from "react";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: number | string;
  color?: "green" | "amber" | "blue";
}

const colorMap = {
  green: "text-green-400",
  amber: "text-amber-400",
  blue: "text-blue-400",
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, color = "blue" }) => {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0B0E1A] p-4 min-h-[100px]">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={clsx("text-3xl font-semibold mt-1", colorMap[color])}>{value}</p>
    </div>
  );
};
