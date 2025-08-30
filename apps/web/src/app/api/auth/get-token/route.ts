// pages/api/get-token.ts
import { auth, clerkClient } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = await auth();
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized' });

  const template = process.env.NEST_SERVER_TEMPLATE_CLERK;
  if (!template) return res.status(500).json({ error: 'Template not found' });

  const client = await clerkClient();
  const token = await client.sessions.getToken(sessionId, template);

  return res.status(200).json({ token });
}
