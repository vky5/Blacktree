"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  GitBranch,
  ExternalLink,
  RefreshCw,
  Trash,
  Container,
  FolderOpen,
  Settings,
  Zap,
  FileCode,
} from "lucide-react";
import React from "react";

export type DeploymentStatus = "Pending" | "Running" | "Failed" | "Unknown";
export type Visibility = "Public" | "Private";

interface DeploymentListItemProps {
  name: string;
  status?: DeploymentStatus;
  visibility: Visibility;
  branch: string;
  updatedAt: string;
  visitUrl?: string | null;
  onRedeploy?: () => void;
  onDelete?: () => void;
  onClick?: () => void; // <- added
  // New props to fill middle area
  repository?: string;
  contextDir?: string;
  resourceVersion?: string;
  autoDeploy?: boolean;
  dockerFilePath?: string;
  description?: string;
}

const CircularLoader = () => (
  <div className="relative w-4 h-4">
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

const VisibilityBadge = ({ type }: { type: Visibility }) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        type === "Public"
          ? "bg-blue-900 text-blue-200 border border-blue-700"
          : "bg-purple-900 text-purple-200 border border-purple-700"
      }`}
    >
      {type}
    </span>
  );
};

export default function DeploymentListItem({
  name,
  status,
  visibility,
  branch,
  updatedAt,
  visitUrl,
  onRedeploy,
  onDelete,
  onClick, // <- added
  repository,
  contextDir,
  resourceVersion,
  autoDeploy,
  dockerFilePath,
  description,
}: DeploymentListItemProps) {
  const mapStatus = (s?: string): DeploymentStatus => {
    switch (s) {
      case "Running":
      case "Failed":
      case "Pending":
        return s;
      default:
        return "Unknown";
    }
  };

  const finalStatus = mapStatus(status);

  const statusConfig = {
    Pending: {
      label: "Pending",
      icon: <CircularLoader />,
      className: "bg-yellow-800 text-yellow-300 border border-yellow-500",
    },
    Running: {
      label: "Running",
      icon: <CheckCircle size={14} className="text-green-400" />,
      className: "bg-green-900 text-green-400 border border-green-600",
    },
    Failed: {
      label: "Failed",
      icon: <XCircle size={14} className="text-red-400" />,
      className: "bg-red-900 text-red-400 border border-red-600",
    },
    Unknown: {
      label: "Unknown",
      icon: <XCircle size={14} className="text-gray-400" />,
      className: "bg-gray-800 text-gray-400 border border-gray-600",
    },
  };

  const config = statusConfig[finalStatus];

  return (
    <div
      className="bg-[#0B0F19] rounded-xl border border-[#1a1f2e] p-4 w-full hover:border-[#2a2f3e] transition-colors cursor-pointer"
      onClick={onClick} // <- added
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Container className="w-5 h-5 text-gray-400" />
          <h3 className="text-white font-medium text-lg">{name}</h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5",
              config.className
            )}
          >
            {config.icon}
            {config.label}
          </span>
          <VisibilityBadge type={visibility} />
        </div>
      </div>

      {/* Repository and Branch Info */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <GitBranch className="w-4 h-4" />
          <span>{repository || "Unknown repo"}</span>
          <span className="text-gray-500">•</span>
          <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">
            {branch}
          </span>
        </div>
      </div>

      {/* Details Grid - This fills the middle area */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-gray-400 text-xs">Context</div>
            <div className="text-gray-200">{contextDir || "Root"}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-gray-400 text-xs">Resource</div>
            <div className="text-gray-200 capitalize">
              {resourceVersion || "Basic"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-gray-400 text-xs">Auto Deploy</div>
            <div className={autoDeploy ? "text-green-400" : "text-red-400"}>
              {autoDeploy ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-gray-400 text-xs">Dockerfile</div>
            <div className="text-gray-200 text-xs truncate">
              {dockerFilePath || "Default"}
            </div>
          </div>
        </div>
      </div>

      {/* Description if available */}
      {description && (
        <div className="mb-3 p-2 bg-gray-800/50 rounded text-sm text-gray-300">
          {description}
        </div>
      )}

      {/* Footer Row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>Updated {new Date(updatedAt).toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          {visitUrl && (
            <a
              href={visitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 bg-[#0D1224] text-green-400 hover:text-green-300 rounded border border-white/5 text-xs font-medium transition-colors"
            >
              <ExternalLink size={12} /> Visit
            </a>
          )}
          {onRedeploy && (
            <button
              onClick={onRedeploy}
              className="flex items-center gap-1 px-2 py-1 bg-[#0D1224] text-blue-400 hover:text-blue-300 rounded border border-white/5 text-xs font-medium transition-colors"
            >
              <RefreshCw size={12} /> Redeploy
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-2 py-1 bg-[#0D1224] text-red-400 hover:text-red-300 rounded border border-white/5 text-xs font-medium transition-colors"
            >
              <Trash size={12} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
