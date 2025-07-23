"use client";

import { cn } from "@/lib/utils";
import {
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  Clock,
  GitBranch,
  ExternalLink,
  MoreHorizontal,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Settings,
  Download,
  Trash,
} from "lucide-react";
import React, { useState } from "react";
import VisibilityBadge from "@/components/Deployments/visibilityBadge";

type DeploymentStatus = "Running" | "Building" | "Failed";
type Visibility = "Public" | "Private";

interface DeploymentProps {
  name: string;
  status: DeploymentStatus;
  visibility: Visibility;
  branch: string;
  commit: string;
  requests: string;
  uptime: string;
  updatedAt: string;
  framework: string;
  region: string;
  buildTime: string;
  visitUrl: string;
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

export default function DeploymentListItem({
  name,
  status,
  visibility,
  branch,
  commit,
  requests,
  uptime,
  updatedAt,
  framework,
  region,
  buildTime,
  visitUrl,
}: DeploymentProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusConfig = {
    Running: {
      label: "Running",
      icon: <CheckCircle size={14} className="text-green-400" />,
      className: "bg-green-900 text-green-400 border border-green-600",
    },
    Building: {
      label: "Building",
      icon: <CircularLoader />,
      className: "bg-yellow-800 text-yellow-300 border border-yellow-500",
    },
    Failed: {
      label: "Failed",
      icon: <XCircle size={14} className="text-red-400" />,
      className: "bg-red-900 text-red-400 border border-red-600",
    },
  };

  const config = statusConfig[status] ?? {
  label: "Unknown",
  icon: <XCircle size={14} className="text-gray-400" />,
  className: "bg-gray-800 text-gray-400 border border-gray-600",
};


  return (
    <div className="bg-[#0B0F19] rounded-xl border border-[#1a1f2e] px-5 py-4 flex flex-col gap-2 w-full">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {config.icon}
          <h3 className="text-white font-medium text-lg">{name}</h3>
        </div>

        <div className="relative">
          <button
            className="text-gray-400 hover:text-gray-300 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#0D1224] border border-white/5 rounded-md shadow-lg z-10">
              <ul className="py-1 text-sm text-gray-300">
                <li className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer">
                  <ExternalLink size={14} /> View Live
                </li>
                <li className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer">
                  <BarChart2 size={14} /> View Logs
                </li>
                <li className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer">
                  <RefreshCw size={14} /> Redeploy
                </li>
                <li className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer">
                  <Settings size={14} /> Settings
                </li>
                <li className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 cursor-pointer">
                  <Download size={14} /> Download
                </li>
                <li className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-red-400 cursor-pointer">
                  <Trash size={14} /> Delete
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Status and Visibility Badges */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className={cn(
            "px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5",
            config.className
          )}
        >
          {config.label}
        </span>

        <VisibilityBadge type={visibility} />
      </div>

      {/* Branch and Commit Info */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-300">
          <GitBranch size={14} />
          <span>{branch}</span>
          <span className="text-gray-500">•</span>
          <span className="text-green-400 font-mono">{commit}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-400">
          <div className="flex items-center gap-1">
            <TrendingUp size={14} />
            <span>{requests}</span>
          </div>
          <span>•</span>
          <span>{uptime} uptime</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={14} />
            <span>Updated {updatedAt}</span>
          </div>
          <a
            href={visitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 flex items-center gap-1 font-medium transition-colors"
          >
            <ExternalLink size={14} />
            Visit
          </a>
        </div>
      </div>
    </div>
  );
}
