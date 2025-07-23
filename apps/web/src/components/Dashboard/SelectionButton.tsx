import React, { useState } from "react";
import { BarChart3, Key, Globe } from "lucide-react";

export default function TabComponent({ onTabChange = (update: number) => {} }) {
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { id: 1, label: "Analytics", icon: BarChart3 },
    { id: 2, label: "API Keys", icon: Key },
    { id: 3, label: "Deployments", icon: Globe },
  ];

  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  return (
    <div className="flex bg-[#0D1117] rounded-xl p-2 w-full border border-[#1a1f2e] gap-2">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 flex-1
              text-sm font-medium justify-center
              focus:outline-none focus:ring-2 focus:ring-[#33CF96]/30
              border
              ${
                isActive
                  ? "bg-[#05191D] text-[#33CF96] border-[#1f2e28] shadow-inner"
                  : "text-gray-400 hover:bg-[#1a1f2e] hover:text-white border-transparent"
              }
            `}
          >
            <IconComponent size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
