// pages/api/get-token.ts
import { auth, clerkClient } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

export async function GET() {
  const { sessionId } = await auth();

  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template = process.env.NEST_SERVER_TEMPLATE_CLERK;

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 500 });
  }

  // Await to get ClerkClient instance
  const client = await clerkClient();
  const token = await client.sessions.getToken(sessionId, template);
  const response = NextResponse.json({ jwt: token });
  return response;
}
