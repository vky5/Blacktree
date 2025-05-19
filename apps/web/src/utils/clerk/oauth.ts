// utils/clerk/oauth.ts

"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * Custom hook for handling OAuth sign-ins.
 * Works for both Google and GitHub.
 */
export function useOAuthSignIn() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  /**
   * Initiates the OAuth sign-in process.
   *
   * @param strategy - Clerk OAuth strategy like 'oauth_google' or 'oauth_github'
   * @param redirectPath - Path to redirect after successful sign-in (default is '/')
   */
  const handleOAuthSignIn = async (
    strategy: "oauth_google" | "oauth_github",
    redirectPath: string = "/"
  ) => {
    try {
      // Start the OAuth flow
      const result = await signIn?.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirectPath,
      });

      // Optional: Clerk handles redirect, but you can log for debugging
      console.log("OAuth initiated:", result);
    } catch (error) {
      console.error("OAuth error:", error);
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