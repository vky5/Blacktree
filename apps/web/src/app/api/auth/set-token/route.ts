import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

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

  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 500 });
  }

  const response = NextResponse.json({ message: "Token set" }, { status: 200 });
  const jwtToken = typeof token === "string" ? token : token.jwt;

  response.cookies.set({
    name: "jwt",
    value: jwtToken,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });

  console.log(response);

  return response;
}
