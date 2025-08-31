// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    console.log("🔌 Creating new socket connection to:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/deployments`);
    
    socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deployments`, {
      transports: ["websocket", "polling"], // Allow fallback to polling
      timeout: 10000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Add comprehensive debugging
    socket.on("connect", () => {
      console.log("✅ Socket connected to /deployments");
      console.log("🆔 Socket ID:", socket?.id);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("❌ Socket disconnected. Reason:", reason);
    });

    socket.on("connect_error", (error: unknown) => {
      console.error("🔥 Socket connection error:", error);
    });

    socket.on("error", (error: unknown) => {
      console.error("🔥 Socket error:", error);
    });

    socket.on("reconnect", (attemptNumber: number) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_error", (error: unknown) => {
      console.error("🔄❌ Socket reconnection error:", error);
    });

    // Listen to ALL log events regardless of room
    socket.onAny((eventName: string, ...args: unknown[]) => {
      console.log(`🌐 Global event received: ${eventName}`, args);
      
      // Specifically log newLogLine events
      if (eventName === "newLogLine") {
        console.log("📝 GLOBAL LOG RECEIVED:", args[0]);
      }
    });

    // Also listen directly to newLogLine (this should catch all rooms)
    socket.on("newLogLine", (data: { deploymentId: string; logLine: string }) => {
      console.log("📝 DIRECT LOG RECEIVED (any room):", data);
    });

    // Log initial socket state
    console.log("🔧 Socket created. Connected:", socket.connected);
  }
  return socket;
};