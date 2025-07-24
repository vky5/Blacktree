"use client";

import React from "react";
import { FaCube, FaGlobe } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BlueprintCardProps {
  name: string;
  description: string;
  version: string;
  updatedAt: string;
  deployments: number;
  stars: number;
  isPublic: boolean;
  onEdit: () => void;
  onDeploy: () => void;
  onView: () => void;
}

const BlueprintCard: React.FC<BlueprintCardProps> = ({
  name,
  description,
  version,
  updatedAt,
  deployments,
  stars,
  isPublic,
  onEdit,
  onDeploy,
  onView,
}) => {
  return (
    <Card className="bg-[#0B0F19] border border-zinc-800 rounded-lg p-6 text-white shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FaCube className="text-emerald-500 text-lg" />
            <h2 className="text-xl font-semibold">{name}</h2>
          </div>
          <p className="text-gray-400 mb-2">{description}</p>
          <div className="text-gray-500 text-sm mb-4">
            Version {version} • Updated {updatedAt}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            {isPublic && (
              <div className="flex items-center gap-1 text-emerald-500">
                <FaGlobe /> public
              </div>
            )}
            <div>
              🔗 {deployments} deployments
            </div>
            <div>
              ⭐ {stars} stars
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button onClick={onEdit} className="bg-zinc-800 text-white hover:bg-zinc-700">
          Edit
        </Button>
        <Button onClick={onDeploy} className="bg-[#33CF96] text-black hover:bg-[#2dbd85]">
          Deploy
        </Button>
        <Button onClick={onView} className="bg-zinc-800 text-white hover:bg-zinc-700">
          View Public
        </Button>
      </div>
    </Card>
  );
};

export default BlueprintCard;
