"use client";

import { Suspense } from "react";
import GithubCallback from "@/components/callbacks/GithubCallback";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-white">Loading...</p>}>
      <GithubCallback />
    </Suspense>
  );
}
