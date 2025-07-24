import React, { useState } from "react";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: number;
  label: string;
  icon: LucideIcon;
}

interface TabsProps {
  tabs: Tab[];
  onTabChange?: (tabId: number) => void;
  initialTabId?: number;
}

export default function Tabs({
  tabs,
  onTabChange = () => {},
  initialTabId = tabs[0]?.id,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(initialTabId);

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
              text-sm font-medium justify-center hover:cursor-pointer
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
