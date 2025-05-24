"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function GithubCallback() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

const router = useRouter();

useEffect(() => {
    if (!code) return;

    const exchangeCode = async () => {
        // Exchange code for access token
        const res = await axios.post("/api/auth/github/exchange", { code });
        const data = res.data;

        if (data.access_token) {
            // Send access token to /api/github/exchange
            const exchangeRes = await axios.post("/api/github/exchange", { token: data.access_token });
            const exchangeData = exchangeRes.data;

            if (exchangeData.status === "success") {
                router.push("/developers");
            }
        }
    };

    exchangeCode();
}, [code, router]);

  return <p className="text-white">Connecting to GitHub...</p>;
}
