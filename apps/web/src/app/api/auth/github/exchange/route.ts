// /app/api/github/exchange/route.ts in App Router)
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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

  console.log("Token data", tokenData);

  if (!tokenData.access_token) {
    return NextResponse.json({ error: "Failed to get token" }, { status: 400 });
  }

  // Now forward it to your main backend
//   await fetch("https://your-backend.com/api/store-github-token", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${yourClerkOrSessionToken}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ token: tokenData.access_token }),
//   });

  return NextResponse.json({ success: true });
}
