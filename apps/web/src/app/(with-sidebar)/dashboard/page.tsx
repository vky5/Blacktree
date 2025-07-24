"use client";

import React, { useState } from "react";
import { useSyncUser } from "@/utils/clerk/userSync";
import { useUser } from "@clerk/nextjs";

import WelcomeBanner from "@/components/Dashboard/WelcomeBanner";
import { Button } from "@/components/ui/button";
import DeploymentCard from "@/components/Dashboard/DeploymentCard";
import { StatCard } from "@/components/Dashboard/statCard";
import Tabs from "@/components/Dashboard/SelectionButton";
import APIKeyCard from "@/components/Dashboard/APIKeyCard";
import AnalyticsView from "@/components/Dashboard/AnalyticsView";
import { APIKey } from "@/components/Dashboard/APIKeyCard";

import { BarChart3, Key, Globe } from "lucide-react";

const fakeDeployments = [
  {
    name: "Weather API",
    status: "Running",
    requests: "5.4k",
    port: 3001,
    createdAt: "2025-07-10",
  },
  {
    name: "Auth Service",
    status: "Stopped",
    requests: "1.1k",
    port: 5000,
    createdAt: "2025-07-08",
  },
  {
    name: "Product DB API",
    status: "Running",
    requests: "3.8k",
    port: 4000,
    createdAt: "2025-07-12",
  },
];

const fakeAPIKeys: APIKey[] = [
  {
    id: "key-1",
    name: "Weather Service Key",
    apiKey: "wthr-45acbd89xkq-2341",
    status: "active", // now inferred as "active"
    created: "July 5, 2025",
    lastUsed: "Today, 2h ago",
    requests: 3200,
  },
  {
    id: "key-2",
    name: "Auth Service Key",
    apiKey: "auth-12cdf7a0xyq-8491",
    status: "inactive",
    created: "June 18, 2025",
    lastUsed: "Never used",
    requests: 0,
  },
  {
    id: "key-3",
    name: "Database Sync Key",
    apiKey: "dbs-91xyzc121kq-1933",
    status: "active",
    created: "July 10, 2025",
    lastUsed: "Yesterday",
    requests: 1050,
  },
];


const dashboardTabs = [
  { id: 1, label: "Analytics", icon: BarChart3 },
  { id: 2, label: "API Keys", icon: Key },
  { id: 3, label: "Deployments", icon: Globe },
];

function APIKeyManager() {
  const [copiedKey, setCopiedKey] = useState("");

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="py-5">
      <h2 className="text-xl font-semibold mb-6">Your API Keys</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {fakeAPIKeys.map((apiKey) => (
          <APIKeyCard
            key={apiKey.id}
            apiKey={apiKey} // pass the whole object
            copiedKey={copiedKey}
            copyApiKey={copyApiKey}
          />
        ))}
      </div>
    </div>
  );
}

function DeploymentsView() {
  return (
    <div className="py-8">
      <h1 className="text-xl font-semibold mb-6">All Deployments</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {fakeDeployments.map((deploy, i) => (
          <DeploymentCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  useSyncUser();
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState(1); // Default to Deployments

  if (!isLoaded) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#030712] text-white py-12 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <WelcomeBanner user={user} />
        <Button className="bg-[#33CF96] hover:bg-[#2dbd85] text-black">
          + Deploy New API
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard label="Public APIs" value={2} color="green" />
        <StatCard label="Private APIs" value={5} color="amber" />
        <StatCard label="Total Requests" value="1.2k" color="blue" />
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <Tabs
          tabs={dashboardTabs}
          onTabChange={setActiveTab}
          initialTabId={1}
        />
      </div>

      {/* Content Switch */}
      {activeTab === 1 && <AnalyticsView />}
      {activeTab === 2 && <APIKeyManager />}
      {activeTab === 3 && <DeploymentsView />}
    </div>
  );
}
