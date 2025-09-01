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

interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
  level: "info" | "error" | "warning" | "success" | "debug";
}

// Function to determine log level based on content
const getLogLevel = (message: string): LogEntry["level"] => {
  const lowerMsg = message.toLowerCase();
  if (
    lowerMsg.includes("error") ||
    lowerMsg.includes("failed") ||
    lowerMsg.includes("exception")
  ) {
    return "error";
  }
  if (lowerMsg.includes("warn") || lowerMsg.includes("warning")) {
    return "warning";
  }
  if (
    lowerMsg.includes("success") ||
    lowerMsg.includes("completed") ||
    lowerMsg.includes("✅")
  ) {
    return "success";
  }
  if (lowerMsg.includes("debug") || lowerMsg.includes("verbose")) {
    return "debug";
  }
  return "info";
};

// Function to format log message with syntax highlighting
const formatLogMessage = (message: string) => {
  // Highlight URLs
  message = message.replace(
    /(https?:\/\/[^\s]+)/g,
    '<span class="text-blue-400 underline">$1</span>'
  );

  // Highlight file paths
  message = message.replace(
    /([\/\w.-]+\.(js|ts|jsx|tsx|json|yml|yaml))/g,
    '<span class="text-green-400">$1</span>'
  );

  // Highlight numbers
  message = message.replace(
    /\b(\d+)\b/g,
    '<span class="text-purple-400">$1</span>'
  );

  // Highlight quoted strings
  message = message.replace(
    /"([^"]*)"/g,
    '<span class="text-yellow-400">"$1"</span>'
  );

  return message;
};

const LogLine: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  const levelColors = {
    info: "text-gray-300 bg-gray-900/30",
    error: "text-red-300 bg-red-900/20 border-l-2 border-red-500",
    warning: "text-yellow-300 bg-yellow-900/20 border-l-2 border-yellow-500",
    success: "text-green-300 bg-green-900/20 border-l-2 border-green-500",
    debug: "text-blue-300 bg-blue-900/20",
  };

  const levelIcons = {
    info: "📝",
    error: "❌",
    warning: "⚠️",
    success: "✅",
    debug: "🔍",
  };

  return (
    <div
      className={`group flex gap-3 py-2 px-3 rounded-md mb-1 hover:bg-gray-800/50 transition-colors ${
        levelColors[entry.level]
      }`}
    >
      {/* Timestamp */}
      <div className="flex-shrink-0 text-xs text-gray-500 font-mono w-20">
        {entry.timestamp.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>

      {/* Level Icon */}
      <div className="flex-shrink-0 text-sm">{levelIcons[entry.level]}</div>

      {/* Log Message */}
      <div
        className="flex-1 text-sm font-mono whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: formatLogMessage(entry.message) }}
      />

      {/* Copy button (appears on hover) */}
      <button
        onClick={() => navigator.clipboard.writeText(entry.message)}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
      >
        📋
      </button>
    </div>
  );
};

export default function DeploymentDetailsPage() {
  const { id } = useParams();
  const [versions, setVersions] = useState<DeploymentVersionCardProps[]>([]);
  const [selectedVersion, setSelectedVersion] =
    useState<DeploymentVersionCardProps | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsRef = useRef<HTMLDivElement>(null);
  const logIdCounter = useRef(0);

  // Load stored logs when version changes or when socket disconnects
  useEffect(() => {
    if (!selectedVersion) return;

    // Check if this is not the latest version OR socket is disconnected
    const isLatestVersion = selectedVersion.id === versions[0]?.id;
    const shouldLoadStoredLogs = !isLatestVersion || !socketConnected;

    if (shouldLoadStoredLogs && selectedVersion.buildLogsUrl) {
      console.log(`📚 Loading stored logs for version: ${selectedVersion.id}`);
      const storedLogLines = selectedVersion.buildLogsUrl
        .split("\n")
        .filter((line) => line.trim() !== "");

      const storedLogEntries: LogEntry[] = storedLogLines.map(
        (line, index) => ({
          id: `stored-log-${selectedVersion.id}-${index}`,
          message: line,
          timestamp: new Date(selectedVersion.createdAt), // Use creation time for stored logs
          level: getLogLevel(line),
        })
      );

      setLogEntries(storedLogEntries);
      console.log(`📖 Loaded ${storedLogEntries.length} stored log entries`);
    }
  }, [selectedVersion, socketConnected, versions]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logEntries, autoScroll]);

  // Handle manual scroll to detect if user scrolled up
  const handleScroll = () => {
    if (logsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setAutoScroll(isAtBottom);
    }
  };

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

    if (socket.connected) {
      setSocketConnected(true);
    }

    // Reset logs when switching versions (stored logs will be loaded by separate useEffect)
    setLogEntries([]);

    console.log(`📡 Subscribing to logs for deployment: ${selectedVersion.id}`);
    socket.emit("subscribeToLogs", { deploymentId: selectedVersion.id });

    const handleNewLog = (data: { deploymentId: string; logLine: string }) => {
      console.log("📝 Received log:", data);
      if (data.deploymentId === selectedVersion.id) {
        const newEntry: LogEntry = {
          id: `log-${++logIdCounter.current}`,
          message: data.logLine.trim(),
          timestamp: new Date(),
          level: getLogLevel(data.logLine),
        };

        setLogEntries((prev) => [...prev, newEntry]);
      }
    };

    socket.on("newLogLine", handleNewLog);

    // Add initial connection message
    const connectionEntry: LogEntry = {
      id: `log-${++logIdCounter.current}`,
      message: `Connected to deployment logs for ${selectedVersion.id}`,
      timestamp: new Date(),
      level: "info",
    };
    setLogEntries([connectionEntry]);

    return () => {
      socket.off("newLogLine", handleNewLog);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
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

      {/* Right pane: beautified logs */}
      <div className="w-2/3 bg-[#0B0F19] rounded-xl border border-gray-800/50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Live Deployment Logs</h2>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                socketConnected
                  ? "bg-green-900/30 text-green-400 border border-green-500/30"
                  : "bg-red-900/30 text-red-400 border border-red-500/30"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? "bg-green-500" : "bg-red-500"
                } ${socketConnected ? "animate-pulse" : ""}`}
              />
              {socketConnected ? "Connected" : "Disconnected"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLogEntries([])}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              Clear Logs
            </button>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                autoScroll
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {autoScroll ? "🔒 Auto-scroll" : "🔓 Manual"}
            </button>
          </div>
        </div>

        {/* Logs container */}
        <div
          ref={logsRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto p-4 space-y-1"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {selectedVersion?.id === versions[0]?.id ? (
            // Latest version → show live logs
            logEntries.length > 0 ? (
              logEntries.map((entry) => (
                <LogLine key={entry.id} entry={entry} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="text-4xl mb-4">📡</div>
                <p className="text-lg mb-2">Waiting for logs...</p>
                <p className="text-sm">
                  Logs will appear here as your deployment runs
                </p>
              </div>
            )
          ) : (
            // Older versions → show deployment URL reference
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-center">
                <p className="text-lg mb-2 text-gray-300">
                  Build Log Reference
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <code className="text-blue-400 break-all">
                    {selectedVersion?.deploymentUrl || "No URL available"}
                  </code>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Historical logs for version {selectedVersion?.id}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with stats */}
        <div className="px-4 py-2 border-t border-gray-800/50 text-xs text-gray-500 flex items-center justify-between">
          <div>
            Version: {selectedVersion?.id} • ID:{" "}
            {selectedVersion?.id?.slice(0, 8)}...
          </div>
          <div>
            {logEntries.length} log{" "}
            {logEntries.length === 1 ? "entry" : "entries"}
          </div>
        </div>
      </div>
    </div>
  );
}
