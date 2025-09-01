// DeploymentVersionCard.tsx
"use client";

import React from "react";
import { CheckCircle, XCircle, Hash, Calendar, Zap } from "lucide-react";

export type DeploymentStatus =
  | "pending"
  | "built"
  | "running"
  | "stopped"
  | "failed"
  | "live";

export interface DeploymentVersionCardProps {
  id: string;
  status: DeploymentStatus;
  createdAt: string;
  autoDeploy?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  deploymentUrl?: string | null;
  index: number; // for version numbering
  buildLogsUrl: string | null | undefined;
}

const CircularLoader = () => (
  <div className="w-4 h-4">
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16">
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="opacity-25"
      />
      <path
        fill="currentColor"
        d="M8 2a6 6 0 016 6h-2a4 4 0 00-4-4V2z"
        className="opacity-75"
      />
    </svg>
  </div>
);

const statusConfig: Record<
  DeploymentStatus,
  { label: string; colorClass: string; icon: React.ReactElement }
> = {
  pending: {
    label: "Pending",
    colorClass: "bg-yellow-900/50 text-yellow-300 border border-yellow-500/30",
    icon: <CircularLoader />,
  },
  built: {
    label: "Built",
    colorClass: "bg-blue-900/50 text-blue-400 border border-blue-600/30",
    icon: <CheckCircle size={14} className="text-blue-400" />,
  },
  running: {
    label: "Running",
    colorClass: "bg-green-900/50 text-green-400 border border-green-600/30",
    icon: <CheckCircle size={14} className="text-green-400" />,
  },
  stopped: {
    label: "Stopped",
    colorClass: "bg-gray-900/50 text-gray-400 border border-gray-600/30",
    icon: <XCircle size={14} className="text-gray-400" />,
  },
  failed: {
    label: "Failed",
    colorClass: "bg-red-900/50 text-red-400 border border-red-600/30",
    icon: <XCircle size={14} className="text-red-400" />,
  },
  live: {
    label: "Live",
    colorClass:
      "bg-emerald-900/50 text-emerald-400 border border-emerald-600/30",
    icon: <CheckCircle size={14} className="text-emerald-400" />,
  },
};

export function DeploymentVersionCard({
  id,
  status,
  createdAt,
  autoDeploy,
  isSelected,
  onSelect,
  deploymentUrl,
}: DeploymentVersionCardProps) {
  const cfg = statusConfig[status] || statusConfig.pending;

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? "border-[#33CF96] bg-[#0B1120] shadow-lg shadow-[#33CF96]/20"
          : "border-[#1a1f2e] bg-[#0B0F19] hover:border-[#2a2f3e] hover:bg-[#0E1322]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-white">{id}</span>
        </div>
        <span
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${cfg.colorClass}`}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Deployment Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Zap className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400">Auto Deploy:</span>
          <span className={autoDeploy ? "text-green-400" : "text-orange-400"}>
            {autoDeploy ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              deploymentUrl ? "bg-green-400" : "bg-gray-500"
            }`}
          />
          <span className="text-gray-400">
            {deploymentUrl ? "URL Available" : "No URL"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-700">
          <Calendar className="w-3 h-3" />
          <span>{new Date(createdAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
