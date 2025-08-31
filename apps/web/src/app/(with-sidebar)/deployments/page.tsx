"use client";

import React, { useEffect, useState } from "react";
import { useSyncUser } from "@/utils/clerk/userSync";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/Dashboard/statCard";
import DeploymentHeading from "@/components/Deployments/DeploymentPageHeading";
import DeploymentListItem from "@/components/Deployments/DeploymentListItem";
import axios from "axios";
import BigLoader from "@/components/ui/BigLoader";
import { useRouter } from "next/navigation"; 

export default function DeploymentsPage() {
  useSyncUser();
  const { isLoaded } = useUser();
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 

  useEffect(() => {
    const fetchDeployments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/hosted",
          { withCredentials: true }
        );
        setDeployments(res.data);
      } catch (err) {
        console.error("Error fetching deployments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments(); // only once
  }, []);

  if (!isLoaded || loading) return <BigLoader />;

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

      {/* Fixed container width to prevent excessive stretching */}
      <div className="max-w-8xl mx-auto space-y-4">
        {deployments.map((item: DeploymentItem, idx: number) => {
          const d = item.deployment;

          return (
            <DeploymentListItem
              key={item.id || idx}
              name={d?.name || "Untitled API"}
              status={
                item.deploymentStatus?.toLowerCase() === "pending"
                  ? "Pending"
                  : item.deploymentStatus?.toLowerCase() === "running"
                  ? "Running"
                  : item.deploymentStatus?.toLowerCase() === "failed"
                  ? "Failed"
                  : "Unknown"
              }
              visibility={d?.private ? "Private" : "Public"}
              branch={d?.branch || "main"}
              updatedAt={
                d?.updatedAt || d?.createdAt || new Date().toISOString()
              }
              visitUrl={item.deploymentUrl || null}
              // New props to fill middle area with non-sensitive data
              repository={d?.repository}
              contextDir={d?.contextDir}
              resourceVersion={d?.resourceVersion}
              autoDeploy={item.autoDeploy}
              dockerFilePath={d?.dockerFilePath}
              description={d?.description || undefined}
              onRedeploy={() => {
                // Call your redeploy API here
                console.log("Redeploy", item.id);
              }}
              onDelete={() => {
                // Call your delete API here
                console.log("Delete", item.id);
              }}
              onClick={() => router.push(`/deployments/${d.id}`)} 
            />
          );
        })}
      </div>
    </div>
  );
}

/*
first flow of the code is that 

sbse phele user jb deploy pr ek baar bhi click krta hai to yha deployversion bn jayega hme bs vohi version chaiye 

hm kisi bhi user ke sari deployversion dundenge aur uska status print kr denge.... this is good 


and jb koi user kisi deployment pr click krega tb use logs mei show kr denge ki kya chl rha hai...

*/

// Define types for the deployment object
interface Deployment {
  id: string;
  name: string;
  repository: string;
  branch: string;
  dockerFilePath: string;
  contextDir: string;
  userId: string;
  portNumber: number | null;
  envVars: Record<string, string> | null; // instead of any
  resourceVersion: string;
  description: string | null;
  tags: string[] | null; // instead of any
  private: boolean;
  webhookid: string;
  createdAt: string;
  updatedAt: string;
}

interface DeploymentItem {
  id: string;
  deployment: Deployment;
  imageUrl: string | null;
  taskDefinitionArn: string | null;
  taskArn: string | null;
  autoDeploy: boolean;
  deploymentUrl: string | null;
  deploymentStatus: "pending" | "running" | "failed" | string;
  createdAt: string;
  buildLogsUrl: string | null;
  runTimeLogsUrl: string | null;
}
