"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import BigLoader from "@/components/ui/BigLoader";
import {
  DeploymentVersionCard,
  DeploymentVersionCardProps,
  DeploymentStatus,
} from "@/components/Deployments/DeploymentVersionCard";
import { getSocket } from "@/utils/socket";

// Map backend status string to frontend DeploymentStatus
const mapStatus = (status?: string): DeploymentStatus => {
  if (!status) return "pending";
  switch (status.toLowerCase()) {
    case "pending":
      return "pending";
    case "built":
      return "built";
    case "running":
      return "running";
    case "stopped":
      return "stopped";
    case "failed":
      return "failed";
    case "live":
      return "live";
    default:
      return "pending";
  }
};

interface BackendDeployment {
  id: string;
  deploymentUrl: string | null;
  autoDeploy: boolean;
  deploymentStatus?: string;
  createdAt: string;
}

export default function DeploymentDetailsPage() {
  const { id } = useParams(); // deployment ID from URL
  const [versions, setVersions] = useState<DeploymentVersionCardProps[]>([]);
  const [selectedVersion, setSelectedVersion] =
    useState<DeploymentVersionCardProps | null>(null);
  const [logs, setLogs] = useState<string>("Loading logs...");
  const [loading, setLoading] = useState(true);

  const logsRef = useRef<HTMLDivElement>(null);

  // Fetch deployment versions from backend
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const res = await axios.get<BackendDeployment[]>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/hosted/${id}`,
          { withCredentials: true }
        );

        // Map backend deployments to DeploymentVersionCardProps
        const mappedVersions: DeploymentVersionCardProps[] = res.data.map(
          (d, index) => ({
            id: d.id,
            version: `v1.${index + 1}`,
            status: mapStatus(d.deploymentStatus),
            createdAt: d.createdAt,
            autoDeploy: d.autoDeploy,
            deploymentUrl: d.deploymentUrl,
            index,
          })
        );

        setVersions(mappedVersions);
        if (mappedVersions.length > 0) setSelectedVersion(mappedVersions[0]);
      } catch (err) {
        console.error("Failed to fetch deployment versions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [id]);

  // WebSocket: subscribe to logs for selected deployment version
  useEffect(() => {
    if (!selectedVersion) return;

    const socket = getSocket();

    // Reset logs when switching versions
    setLogs("");

    // Subscribe to logs for this deployment version
    socket.emit("subscribeToLogs", { deploymentId: selectedVersion.id });

    // Handler for incoming log lines
    const handleNewLog = (logLine: string) => {
      setLogs((prev) => prev + logLine + "\n");

      // Auto-scroll logs
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight;
      }
    };

    socket.on("newLogLine", handleNewLog);

    return () => {
      socket.off("newLogLine", handleNewLog);
    };
  }, [selectedVersion]);

  if (loading) return <BigLoader />;

  return (
    <div className="min-h-screen bg-[#030712] text-white flex gap-6 py-6 px-4">
      {/* Left pane: deployment versions */}
      <div
        className="w-1/3 space-y-4 max-h-screen overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {versions.map((v) => (
          <DeploymentVersionCard
            key={v.id}
            {...v}
            isSelected={selectedVersion?.id === v.id}
            onSelect={() => setSelectedVersion(v)}
          />
        ))}
      </div>

      {/* Right pane: live logs */}
      <div
        ref={logsRef}
        className="w-2/3 bg-[#0B0F19] rounded-xl p-4 overflow-auto max-h-screen font-mono text-sm"
      >
        <h3 className="text-lg font-medium mb-2">
          {/* Logs for {selectedVersion?.version || "N/A"} */}
        </h3>
        <pre className="whitespace-pre-wrap">{logs}</pre>
      </div>
    </div>
  );
}
