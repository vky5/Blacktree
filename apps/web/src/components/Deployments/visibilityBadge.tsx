// components/VisibilityBadge.tsx
import { Globe, Lock } from "lucide-react";
import clsx from "clsx";

interface VisibilityBadgeProps {
  type: "Public" | "Private";
}

export default function VisibilityBadge({ type }: VisibilityBadgeProps) {
  const isPublic = type === "Public";

  return (
    <div
      className={clsx(
        "flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border",
        isPublic
          ? "bg-[#0F172A] text-blue-400 border-blue-700"
          : "bg-[#1E293B] text-slate-300 border-slate-600"
      )}
    >
      {isPublic ? <Globe size={12} /> : <Lock size={12} />}
      {type}
    </div>
  );
}
