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

    socket.on("error", (error) => {
      console.error("🔥 Socket error:", error);
    });
  }
  return socket;
};
