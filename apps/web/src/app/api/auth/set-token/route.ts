import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

  const client = await clerkClient();

  const token = await client.sessions.getToken(sessionId, template);

  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 500 });
  }

  console.log(token);

  const cookieStore = await cookies();

  cookieStore.set({
    name: "clerk_token",
    value: String(token) || "",
    httpOnly: true,
    secure: false, // TODO set to true in production
  });

  return NextResponse.json({ message: "Token set" }, { status: 200 });
}
