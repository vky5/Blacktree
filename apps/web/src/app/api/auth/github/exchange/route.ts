// /app/api/github/exchange/route.ts

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  });

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: params,
  });

  const tokenData = await tokenRes.json();


  if (!tokenData.access_token) {
    return NextResponse.json({ error: "Failed to get token" }, { status: 400 });
  }

  try {
    // Forward token to your NestJS backend, which will verify it and set cookies
    const backendRes = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/project-access`,
      { token: tokenData.access_token },
      {
        withCredentials: true,
      }
    );

    // Check if cookies are being forwarded
    const success = backendRes.status === 200;
    return NextResponse.json({ success });
  } catch (error) {
    console.error("Backend token forwarding failed", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
