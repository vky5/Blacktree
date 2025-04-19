'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function useOAuthSignIn() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const handleOAuthSignIn = async (
    strategy: 'oauth_google' | 'oauth_github',
    redirectTo = '/dashboard'
  ) => {
    try {
      await signIn?.authenticateWithRedirect({
        strategy,
        redirectUrl: '/auth/login', // page that initiated login
        redirectUrlComplete: redirectTo, // where to land after success
      });
    } catch (error) {
      console.error(`[OAuth Error - ${strategy}]`, error);
    }
  };

  return { handleOAuthSignIn };
}
