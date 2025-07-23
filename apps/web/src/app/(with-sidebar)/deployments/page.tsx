"use client";

import React, { useEffect, useState } from "react";
import { useSyncUser } from "@/utils/clerk/userSync";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/Dashboard/statCard";
import DeploymentHeading from "@/components/Deployments/DeploymentPageHeading";
import DeploymentListItem from "@/components/Deployments/DeploymentListItem";
import axios from "axios";

export default function DeploymentsPage() {
  useSyncUser();
  const { user, isLoaded } = useUser();
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    const getAllDeployments = async () => {
      try {
        const res = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/hosted"
        );
        setDeployments(res.data); // assumes it's an array
      } catch (err) {
        console.error("Error fetching deployments:", err);
      }
    };

    getAllDeployments();
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#030712] text-white py-12 px-6">
      <div className="flex justify-between items-center mb-10">
        <DeploymentHeading />
        <Button className="bg-[#33CF96] hover:bg-[#2dbd85] text-black">
          + Deploy New API
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Public APIs" value={2} color="green" />
        <StatCard label="Private APIs" value={5} color="amber" />
        <StatCard label="Total Requests" value="1.2k" color="blue" />
      </div>

      <div className="space-y-5">
        {deployments.map((item: any, idx: number) => {
          const d = item.deployment;

          return (
            <DeploymentListItem
              key={item.id || idx}
              name={d?.name || "Untitled API"}
              status={item.deploymentStatus || "Unknown"}
              visibility={d?.private ? "Private" : "Public"}
              branch={d?.branch || "main"}
              commit={"N/A"} // You can fill this later with real commit if available
              requests={"N/A"} // Replace with real data if available
              uptime={"N/A"} // Replace with uptime if you track it
              updatedAt={d?.updatedAt || d?.createdAt || null}
              framework={"Unknown"} // Update if framework detection is added
              region={"us-east-1"} // Static for now unless tracked
              buildTime={"N/A"} // Fill if available
              visitUrl={item.deploymentUrl || "#"}
            />
          );
        })}
      </div>
    </div>
  );
}
