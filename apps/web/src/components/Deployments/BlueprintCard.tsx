"use client";
import React from "react";
import { FaCube, FaGlobe, FaLock, FaTrash, FaPencilAlt, FaRocket } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BlueprintCardProps {
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

const BlueprintCard: React.FC<BlueprintCardProps> = ({
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
}) => {
  const [owner, repoName] = (repository || "unknown/repo").split("/");

  const handleUserClick = () => {
    if (owner && owner !== "unknown") {
      window.open(`https://github.com/${owner}`, '_blank');
    }
  };

  const handleRepoClick = () => {
    if (repository && repository !== "unknown/repo") {
      window.open(`https://github.com/${repository}`, '_blank');
    }
  };

  return (
    <Card className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-6 text-white shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <FaCube className="text-emerald-500 text-xl" />
          <h2 className="text-2xl font-semibold">{name}</h2>
        </div>
        
        {/* Repo Info */}
        <div className="text-gray-300 space-y-2 ml-1">
          <p className="text-base">
            <span className="text-gray-400">Repo:</span>{" "}
            <span 
              className="text-emerald-500 font-medium cursor-pointer hover:text-emerald-400 hover:underline transition-colors"
              onClick={handleUserClick}
            >
              {owner}
            </span>
            <span className="text-white">/</span>
            <span 
              className="text-white font-medium cursor-pointer hover:text-gray-300 hover:underline transition-colors"
              onClick={handleRepoClick}
            >
              {repoName}
            </span>
            <span className="text-white">@{branch}</span>
          </p>
          <p className="text-base">
            <span className="text-gray-400">Dockerfile:</span>{" "}
            <span className="text-white font-medium">{dockerFilePath}</span>{" "}
            <span className="text-gray-400">in</span>{" "}
            <span className="text-white font-medium">{contextDir}</span>
          </p>
        </div>
        
        {/* Visibility + Version */}
        <div className="flex items-center gap-6 text-base text-gray-400 mt-3 ml-1">
          <div className="flex items-center gap-2">
            {isPrivate ? (
              <><FaLock className="text-red-500" /> <span className="text-red-500">Private</span></>
            ) : (
              <><FaGlobe className="text-emerald-500" /> <span className="text-emerald-500">Public</span></>
            )}
          </div>
          <div>
            Version: <span className="text-white font-medium">{resourceVersion}</span>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <Button
            onClick={onEdit}
            className="bg-zinc-800 text-white hover:bg-zinc-700 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-base font-medium h-auto hover:cursor-pointer"
          >
            <FaPencilAlt className="text-sm" /> Edit
          </Button>
          <Button
            onClick={onDeploy}
            className="bg-emerald-500 text-black hover:bg-emerald-400 hover:text-black flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-base font-medium h-auto transition-colors hover:cursor-pointer"
          >
            <FaRocket className="text-sm" /> Deploy
          </Button>
          <Button
            onClick={onDelete}
            className="bg-red-700 text-white hover:bg-red-800 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-base font-medium h-auto hover:cursor-pointer"
          >
            <FaTrash className="text-sm" /> Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BlueprintCard;