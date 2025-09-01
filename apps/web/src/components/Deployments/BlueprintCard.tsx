"use client";
import React from "react";
import { FaCube, FaGlobe, FaLock } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export interface BlueprintCardProps {
  id: string;
  name: string;
  repository: string;
  dockerFilePath: string;
  contextDir: string;
  branch: string;
  resourceVersion: string;
  private: boolean;
  onEdit: () => void;
  onDeploy: () => void;
  onDelete: () => void;
}

export default function BlueprintCard({
  id,
  name,
  repository,
  dockerFilePath,
  contextDir,
  branch,
  resourceVersion,
  private: isPrivate,
  onEdit,
  onDeploy,
  onDelete,
}: BlueprintCardProps) {
  const [owner, repoName] = (repository || "unknown/repo").split("/");

  const handleUserClick = () => {
    if (owner && owner !== "unknown") {
      window.open(`https://github.com/${owner}`, "_blank");
    }
  };

  const handleRepoClick = () => {
    if (repository && repository !== "unknown/repo") {
      window.open(`https://github.com/${repository}`, "_blank");
    }
  };

  return (
    <div className="bg-[#0B0F19] rounded-xl border border-[#1a1f2e] p-4 w-full hover:border-[#2a2f3e] transition-colors cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <FaCube className="text-emerald-500 text-xl" />
          <h3 className="text-white font-medium text-lg">{name}</h3>
          <h3 className="text-white font-medium text-lg">{id}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isPrivate ? (
            <div className="flex items-center gap-1.5 text-red-500 text-sm">
              <FaLock /> Private
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-500 text-sm">
              <FaGlobe /> Public
            </div>
          )}
        </div>
      </div>

      {/* Repository Info */}
      <div className="flex items-center gap-2 mb-3 text-sm text-gray-300">
        <span
          className="text-emerald-500 font-medium cursor-pointer hover:text-emerald-400 hover:underline"
          onClick={handleUserClick}
        >
          {owner}
        </span>
        <span className="text-white">/</span>
        <span
          className="text-white font-medium cursor-pointer hover:text-gray-300 hover:underline"
          onClick={handleRepoClick}
        >
          {repoName}
        </span>
        <span className="text-white ml-1">@{branch}</span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">Dockerfile</span>
          <span className="text-white font-medium">
            {dockerFilePath || "Default"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">Context</span>
          <span className="text-white font-medium">{contextDir || "Root"}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">Version</span>
          <span className="text-white font-medium">
            {resourceVersion || "v1.0.0"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-3">
        <Button
          onClick={onEdit}
          className="bg-zinc-800 text-white hover:bg-zinc-700 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium h-auto"
        >
          Edit
        </Button>
        <Button
          onClick={onDeploy}
          className="bg-emerald-500 text-black hover:bg-emerald-400 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium h-auto"
        >
          Deploy
        </Button>
        <Button
          onClick={onDelete}
          className="bg-red-700 text-white hover:bg-red-800 flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium h-auto"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
