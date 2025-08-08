"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Tabs from "@/components/Dashboard/SelectionButton";
import { PackagePlus, Package } from "lucide-react";
import IntegrationStep1 from "@/components/Developers/IntegrationStep1.1";
import BlueprintCard from "@/components/Deployments/BlueprintCard";
import BigLoader from "@/components/ui/BigLoader";
import { toast } from "sonner";

function HostAPI() {
  const [activeTab, setActiveTab] = useState(1);
  const [blueprints, setBlueprints] = useState<BlueprintCardProps[]>([]);
  const [loading, setLoading] = useState(false);

  // Delete function to delete the blueprint
  const deleteBlueprint = useCallback(async (id: string) => {
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deployment/${id}`,
        { withCredentials: true }
      );
      if (res.status === 204) {
        setBlueprints((prev) => prev.filter((bp) => bp.id !== id));
        toast.success(`Blueprint ${id} deleted successfully.`);
      }
    } catch (error) {
      console.log("Failed to delete blueprint:", error);
      toast.error(`Failed to delete blueprint ${id}. Please try again.`);
    }
  }, []);

  // deploy the blueprint
  const deployBlueprint = useCallback(async (id: string) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deployment/${id}/build`,
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.success(`Blueprint ${id} deployed successfully.`);
      }
    } catch (error) {
      console.error("Failed to deploy blueprint:", error);
      toast.error(`Failed to deploy blueprint ${id}. Please try again.`);
    }
  }, []);

  // tab options
  const tabOptions = [
    { id: 1, label: "Create Blueprint", icon: PackagePlus },
    { id: 2, label: "My Blueprints", icon: Package },
  ];

  interface BlueprintCardProps {
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

  interface BlueprintResponse {
    id: string;
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

  const fetchBlueprints = async () => {
    if (activeTab !== 2) return;
    setLoading(true);
    try {
      const res = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/deployment/user",
        { withCredentials: true }
      );

      const data = res.data;

      const transformed: BlueprintCardProps[] = data.map(
        (item: BlueprintResponse) => ({
          id: item.id,
          name: item.name,
          repository: item.repository || "unknown/repo",
          dockerFilePath: item.dockerFilePath || "",
          contextDir: item.contextDir || "",
          branch: item.branch || "main",
          resourceVersion: item.resourceVersion || "v1.0.0",
          private: item.private,
          onEdit: () => alert(`Edit ${item.name}`),
          onDeploy: () => deployBlueprint(item.id),
          onDelete: () => deleteBlueprint(item.id), // ⬅️ notice this change
        })
      );

      setBlueprints(transformed);
    } catch (error) {
      console.error("Failed to fetch blueprints:", error);
      toast.error("Failed to fetch blueprints. Please try again later.");
      setBlueprints([]);
    } finally {
      setLoading(false);
    }
  };

  // to refresh the blueprints when the active tab changes
  useEffect(() => {
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

      <div className="mb-8">
        <Tabs tabs={tabOptions} onTabChange={setActiveTab} initialTabId={1} />
      </div>

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
            <BigLoader />
          ) : blueprints.length === 0 ? (
            <p className="text-gray-400">No blueprints found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
