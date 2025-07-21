"use client";

import React from "react";
import { useSyncUser } from "@/utils/clerk/userSync";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

import { StatCard } from "@/components/Dashboard/statCard";
import DeploymentHeading from "@/components/Deployments/DeploymentPageHeading";
import DeploymentListItem from "@/components/Deployments/DeploymentListItem";

export default function DeploymentsPage() {
  useSyncUser();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#030712] text-white py-12 px-6">
      <div className="flex justify-between items-center mb-10">
        <DeploymentHeading />
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

      <div className="space-y-5">
        <DeploymentListItem
          name="weather-api"
          status="Running"
          visibility="Public"
          branch="main"
          commit="a1b2c3d"
          requests="1.2k requests"
          uptime="99.9%"
          updatedAt="2 hours ago"
          framework="Node.js"
          region="us-east-1"
          buildTime="45s"
          visitUrl="https://example.com"
        />

        <DeploymentListItem
          name="user-auth-service"
          status="Failed"
          visibility="Private"
          branch="develop"
          commit="e4f5g6h"
          requests="856 requests"
          uptime="98.5%"
          updatedAt="5 minutes ago"
          framework="Python"
          region="us-west-2"
          buildTime="2m 15s"
          visitUrl="https://example.com"
        />


        <DeploymentListItem
          name="user-auth-service"
          status="Building"
          visibility="Private"
          branch="develop"
          commit="e4f5g6h"
          requests="856 requests"
          uptime="98.5%"
          updatedAt="5 minutes ago"
          framework="Python"
          region="us-west-2"
          buildTime="2m 15s"
          visitUrl="https://example.com"
        />
      </div>
    </div>
  );
}
