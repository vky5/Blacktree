// pages/api/get-token.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  // Get session from Clerk
  const { sessionId } = await auth();
  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the token template
  const template = process.env.NEST_SERVER_TEMPLATE_CLERK;
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 500 });
  }

  // Get ClerkClient and generate the token
  const client = await clerkClient();
  const tokenObj = await client.sessions.getToken(sessionId, template);

  // Ensure the token is a string (extract if needed)
  const jwtToken = typeof tokenObj === "string" ? tokenObj : tokenObj.jwt;

  // Return flat JWT response
  return NextResponse.json({ jwt: jwtToken }, { status: 200 });
}
