// import React, { useState } from "react";
// import { BarChart3, Key, Globe } from "lucide-react";

// const TabComponent = ({ onTabChange = (update: number) => {} }) => {
//   const [activeTab, setActiveTab] = useState(1);

//   const tabs = [
//     { id: 1, label: "Analytics", icon: BarChart3 },
//     { id: 2, label: "API Keys", icon: Key },
//     { id: 3, label: "Deployments", icon: Globe },
//   ];

//   const handleTabClick = (tabId: number) => {
//     setActiveTab(tabId);
//     onTabChange(tabId);
//   };

//   return (
//     <div className="flex bg-slate-900 rounded-lg p-1 max-w-md mx-auto">
//       {tabs.map((tab) => {
//         const IconComponent = tab.icon;
//         const isActive = activeTab === tab.id;

//         return (
//           <button
//             key={tab.id}
//             onClick={() => handleTabClick(tab.id)}
//             className={`
//               flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 flex-1
//               ${
//                 isActive
//                   ? "bg-teal-600 text-white shadow-lg"
//                   : "text-slate-300 hover:text-white hover:bg-slate-800"
//               }
//             `}
//           >
//             <IconComponent size={18} />
//             <span className="text-sm font-medium">{tab.label}</span>
//           </button>
//         );
//       })}
//     </div>
//   );
// };
