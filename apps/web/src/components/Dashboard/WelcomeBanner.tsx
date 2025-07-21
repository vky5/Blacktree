import React from "react";
import type { UserResource } from "@clerk/types";

export default function WelcomeBanner({ user }: { user: UserResource | null }) {
  if (!user) return null;

  return (
    <div className="">
      <h1 className="text-2xl font-semibold mb-2">
        Welcome, {user.fullName || "Guest"} 👋
      </h1>

      <p className="text-sm text-gray-400">
        Manage your APIs and deployments
      </p>
    </div>
  );
}
