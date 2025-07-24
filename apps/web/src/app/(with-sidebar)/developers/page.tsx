"use client";

import React, { useState } from "react";
import Tabs from "@/components/Dashboard/SelectionButton";
import { PackagePlus, Package } from "lucide-react";
import IntegrationStep1 from "@/components/Developers/IntegrationStep1.1";
import BlueprintCard from "@/components/Deployments/BlueprintCard";

function HostAPI() {
  const [activeTab, setActiveTab] = useState(1); // 1 = Create Blueprint, 2 = My Blueprints

  const tabOptions = [
    { id: 1, label: "Create Blueprint", icon: PackagePlus },
    { id: 2, label: "My Blueprints", icon: Package },
  ];

  const fakeBlueprints = [
    {
      name: "Weather API Service",
      description: "Real-time weather data API with caching and rate limiting",
      version: "v1.0.3",
      updatedAt: "1 week ago",
      deployments: 12,
      stars: 8,
      isPublic: true,
      onEdit: () => alert("Edit Weather API"),
      onDeploy: () => alert("Deploy Weather API"),
      onView: () => alert("View Weather API"),
    },
    {
      name: "Auth Service",
      description: "User authentication and authorization microservice",
      version: "v2.1.0",
      updatedAt: "3 days ago",
      deployments: 5,
      stars: 15,
      isPublic: false,
      onEdit: () => alert("Edit Auth Service"),
      onDeploy: () => alert("Deploy Auth Service"),
      onView: () => alert("View Auth Service"),
    },
  ];


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
          <IntegrationStep1 />
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">My Blueprints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {fakeBlueprints.map((bp, index) => (
              <BlueprintCard key={index} {...bp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HostAPI;
