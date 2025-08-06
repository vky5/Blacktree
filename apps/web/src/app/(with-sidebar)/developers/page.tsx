"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Tabs from "@/components/Dashboard/SelectionButton";
import { PackagePlus, Package } from "lucide-react";
import IntegrationStep1 from "@/components/Developers/IntegrationStep1.1";
import BlueprintCard from "@/components/Deployments/BlueprintCard";

function HostAPI() {
  const [activeTab, setActiveTab] = useState(1);
  const [blueprints, setBlueprints] = useState<BlueprintCardProps[]>([]);

  const [loading, setLoading] = useState(false);

  const tabOptions = [
    { id: 1, label: "Create Blueprint", icon: PackagePlus },
    { id: 2, label: "My Blueprints", icon: Package },
  ];

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

  interface BlueprintResponse {
    name: string;
    repository: string;
    dockerFilePath: string;
    contextDir: string;
    portNumber: number | null;
    branch: string;
    envVars: Record<string, string> | null;
    resourceVersion: string;
    private: boolean;
  }
  // Fetch blueprints from backend
  useEffect(() => {
    const fetchBlueprints = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/deployment/user", // Change if your endpoint differs
          { withCredentials: true },
        );

        const data = res.data;

        const transformed = data.map((item: BlueprintResponse) => ({
          name: item.name,
          description: `Repo: ${item.repository}`,
          version: item.resourceVersion || "v1.0.0",
          updatedAt: "Just now", // Default, unless backend provides it
          deployments: 0, // Default fallback
          stars: 0,
          isPublic: !item.private,
          onEdit: () => alert(`Edit ${item.name}`),
          onDeploy: () => alert(`Deploy ${item.name}`),
          onView: () => alert(`View ${item.name}`),
        }));

        setBlueprints(transformed);
      } catch (error) {
        console.error("Failed to fetch blueprints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprints();
  }, [activeTab]);

  return (
    <div className="bg-[#030712] min-h-screen p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create & Deploy</h1>
        <p className="text-gray-400">
          Create blueprints or deploy from the marketplace
        </p>
      </div>

      {/* Tab Selector */}
      <div className="mb-8">
        <Tabs tabs={tabOptions} onTabChange={setActiveTab} initialTabId={1} />
      </div>

      {/* Content Switch */}
      {activeTab === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Create a New Blueprint</h2>
          <IntegrationStep1 onSuccessRedirectToTab2={() => setActiveTab(2)} />
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">My Blueprints</h2>
          {loading ? (
            <p>Loading...</p>
          ) : blueprints.length === 0 ? (
            <p className="text-gray-400">No blueprints found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {blueprints.map((bp, index) => (
                <BlueprintCard key={index} {...bp} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HostAPI;
