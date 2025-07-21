"use client";

import React from "react";
import { useSyncUser } from "@/utils/clerk/userSync";
import { useUser } from "@clerk/nextjs";
import WelcomeBanner from "@/components/Dashboard/WelcomeBanner";
import { Button } from "@/components/ui/button";
import DeploymentCard from "@/components/Dashboard/DeploymentCard";
import { StatCard } from "@/components/Dashboard/statCard";

export default function DashboardPage() {
  useSyncUser();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#030712] text-white py-12 px-6">
      <div className="flex justify-between items-center mb-10">
        <WelcomeBanner user={user} />
        <Button className="bg-[#33CF96] hover:bg-[#2dbd85] text-black">
          + Deploy New API
        </Button>
      </div>

      {/*  */}
      {/* <div className="text-xl py-5">Stats</div> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Public APIs" value={2} color="green" />
        <StatCard label="Private APIs" value={5} color="amber" />
        <StatCard label="Total Requests" value="1.2k" color="blue" />
      </div>

      {/* Heading */}
      <h1 className="text-xl py-5">All Deployments</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <DeploymentCard />
        <DeploymentCard />
        <DeploymentCard />
        <DeploymentCard />
        <DeploymentCard />
        <DeploymentCard />
        <DeploymentCard />
        <DeploymentCard />
      </div>
    </div>
  );
}
