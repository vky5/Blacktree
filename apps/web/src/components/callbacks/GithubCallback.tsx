"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export default function GithubCallback() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const router = useRouter();

  useEffect(() => {
    if (!code) return;

    const exchangeCode = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/project-access`,
          { code },
          {
            withCredentials: true, // Needed to receive cookies from backend
          }
        );

        if (res.status===200) {
          toast.success("Connected to GitHub successfully!");
          router.push("/developers?step=1");
        } else {
          toast.error("GitHub connection failed.");
        }
      } catch (err) {
        console.error("GitHub OAuth error:", err);
        toast.error("Something went wrong during GitHub connection.");
        router.push("/developers");
      }
    };

    exchangeCode();
  }, [code, router]);

  return <p className="text-white">Connecting to GitHub...</p>;
}
