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
  deploymentUrl: string | null; // just a string for older versions
  autoDeploy: boolean;
  deploymentStatus?: string;
  createdAt: string;
}

export default function DeploymentDetailsPage() {
  const { id } = useParams();
  const [versions, setVersions] = useState<DeploymentVersionCardProps[]>([]);
  const [selectedVersion, setSelectedVersion] =
    useState<DeploymentVersionCardProps | null>(null);
  const [logs, setLogs] = useState<string>("Loading logs...");
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
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

  // WebSocket: subscribe to logs for selected version
  useEffect(() => {
    if (!selectedVersion) return;

    const socket = getSocket();
    
    // Add connection debugging
    const handleConnect = () => {
      console.log("✅ Socket connected to /deployments");
      setSocketConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
      setSocketConnected(false);
    };
    
    const handleError = (error: unknown) => {
      console.error("🔥 Socket error:", error);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);

    // Check if already connected
    if (socket.connected) {
      setSocketConnected(true);
    }

    setLogs("Connecting to logs..."); // reset logs on version switch

    console.log(`📡 Subscribing to logs for deployment: ${selectedVersion.id}`);
    socket.emit("subscribeToLogs", { deploymentId: selectedVersion.id });

    const handleNewLog = (data: { deploymentId: string; logLine: string }) => {
      console.log("📝 Received log:", data); // Add debugging
      if (data.deploymentId === selectedVersion.id) {
        // prepend latest logs to top
        setLogs((prev) => {
          const newLogs = data.logLine + "\n" + prev;
          console.log("📄 Updated logs length:", newLogs.length);
          return newLogs;
        });

        // Auto-scroll to top for latest logs
        if (logsRef.current) logsRef.current.scrollTop = 0;
      }
    };

    socket.on("newLogLine", handleNewLog);

    // Set timeout to show "no logs" message if nothing comes in
    const timeoutId = setTimeout(() => {
      setLogs(prev => {
        if (prev === "Connecting to logs...") {
          return "No logs available. Try triggering a deployment action to see logs.";
        }
        return prev;
      });
    }, 5000);

    return () => {
      socket.off("newLogLine", handleNewLog);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      clearTimeout(timeoutId);
    };
  }, [selectedVersion]);

  if (loading) return <BigLoader />;

  return (
    <div className="min-h-screen bg-[#030712] text-white flex gap-6 py-6 px-4">
      {/* Left pane: deployment versions */}
      <div
        className="w-1/3 space-y-4 max-h-screen overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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

      {/* Right pane: live logs or build URL */}
      <div
        ref={logsRef}
        className="w-2/3 bg-[#0B0F19] rounded-xl p-4 overflow-auto max-h-screen font-mono text-sm"
      >
        {/* Connection status indicator */}
        <div className="mb-2 text-xs opacity-60">
          Socket: {socketConnected ? "🟢 Connected" : "🔴 Disconnected"} | 
          {/* Version: {selectedVersion?.version} |  */}
          ID: {selectedVersion?.id?.slice(0, 8)}...
        </div>
        
        {selectedVersion?.id === versions[0].id ? (
          // Latest version → show live logs
          <pre className="whitespace-pre-wrap">
            {logs || "Waiting for logs..."}
          </pre>
        ) : (
          // Older versions → show deploymentUrl string
          <div>
            <span className="font-semibold">Build Log Reference:</span>{" "}
            {selectedVersion?.deploymentUrl || "N/A"}
          </div>
        )}
      </div>
    </div>
  );
}