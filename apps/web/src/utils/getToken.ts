import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getJWT() {
  const { sessionId } = await auth();

  if (!sessionId) {
    return;
  }

  const template = process.env.NEST_SERVER_TEMPLATE_CLERK;

  if (!template) {
    return;
  }

  const client = await clerkClient();
  const token = await client.sessions.getToken(sessionId, template);


  return token; // this is the token that is recieved from the backend 
}
