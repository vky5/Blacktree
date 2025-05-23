'use client';

import { useSignIn } from '@clerk/nextjs';
import { OAuthStrategy } from '@clerk/types';

export function useOAuthSignIn() {
  const { signIn } = useSignIn();

  const handleOAuthSignIn = async (
    strategy: OAuthStrategy,
    redirectPath: string = '/'
  ) => {
    if (!signIn) {
      console.error("SignIn instance not initialized.");
      return;
    }

    try {
      // Remove the redirectUrl parameter completely
      const result = await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirectPath,
      });

      console.log("OAuth redirect initiated:", result);
    } catch (error: any) {
      console.error("OAuth SignIn Error:", error?.errors || error);
    }
  };

  return { handleOAuthSignIn };
}

/*
User clicks "Continue with Google"
     ↓
Google Auth Page
     ↓
redirects to → /sso-callback (your `redirectUrl`)
     ↓
Clerk finalizes login, creates session
     ↓
redirects to → /dashboard (your `redirectUrlComplete`)
*/