"use client";

import React, { useState } from "react";
import Tabs from "@/components/Dashboard/SelectionButton";
import { PackagePlus, Package } from "lucide-react";
import IntegrationStep1 from "@/components/Developers/IntegrationStep1.1";

function HostAPI() {
  const [currentStep, setCurrentStep] = useState(2);
  const [readyForNext, setReadyForNext] = useState(false);
  const [activeTab, setActiveTab] = useState(1); // 1 = Create Blueprint, 2 = My Blueprints

  const tabOptions = [
    { id: 1, label: "Create Blueprint", icon: PackagePlus },
    { id: 2, label: "My Blueprints", icon: Package },
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
        <Tabs
          tabs={tabOptions}
          onTabChange={setActiveTab}
          initialTabId={1}
        />
      </div>

      {/* Content Switch */}
      {activeTab === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Create a New Blueprint</h2>
          {/* Add your create blueprint form or UI here */}
          <IntegrationStep1 />
          
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">My Blueprints</h2>
          {/* Add your blueprints list or components here */}
          <p className="text-gray-400">Coming soon: List of your saved blueprints...</p>
        </div>
      )}
    </div>
  );
}

export default HostAPI;
