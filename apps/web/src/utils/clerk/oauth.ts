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
        redirectUrlComplete: redirectPath,
      });

      console.log("OAuth redirect initiated:", result);
    } catch (error: any) {
      console.error("OAuth SignIn Error:", error?.errors || error);
    }
  };

  return { handleOAuthSignIn };
}