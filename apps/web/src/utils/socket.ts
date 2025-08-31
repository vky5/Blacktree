// src/utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deployments`, {
      transports: ["websocket"],
    });

    // Add debugging
    socket.on("connect", () => {
      console.log("✅ Socket connected to /deployments");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("error", (error: unknown) => {
      console.error("🔥 Socket error:", error);
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
    socket.on(
      "newLogLine",
      (data: { deploymentId: string; logLine: string }) => {
        console.log("📝 DIRECT LOG RECEIVED (any room):", data);
      }
    );
  }
  return socket;
};
