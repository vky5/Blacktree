// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace("/api/v1", "") || "";
    const socketUrl = `${backendUrl}/deployments`;

    console.log("🔌 Creating new socket connection to:", socketUrl);

    socket = io(socketUrl, {
      transports: ["websocket", "polling"], // prefer WebSocket, fallback to polling
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // forceNew removed
    });

    // Handle connect/disconnect events
    socket.on("connect", () => {
      console.log("✅ Socket connected to /deployments");
      console.log("🆔 Socket ID:", socket?.id);
      console.log("🛰 Transport being used:", socket!.io.engine.transport.name);
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

    // Optional: global logging for all events
    socket.onAny((eventName: string, ...args: unknown[]) => {
      console.log(`🌐 Global event received: ${eventName}`, args);

      if (eventName === "newLogLine") {
        console.log("📝 GLOBAL LOG RECEIVED:", args[0]);
      }
    });

    // Listen directly to newLogLine events for extra safety
    socket.on(
      "newLogLine",
      (data: { deploymentId: string; logLine: string }) => {
        console.log("📝 DIRECT LOG RECEIVED (any room):", data);
      }
    );

    console.log("🔧 Socket created. Connected:", socket.connected);
  }

  return socket;
};
