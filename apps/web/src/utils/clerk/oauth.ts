"use client";

import { useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";

export function useOAuthSignIn() {
  const { signIn } = useSignIn();

  const handleOAuthSignIn = async (
    strategy: OAuthStrategy,
    redirectPath: string = "/"
  ) => {
    if (!signIn) {
      console.error("SignIn instance not initialized.");
      return;
    }

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirectPath,
      });
    } catch (error: unknown) {
      // Safely check for errors property
      if (
        error &&
        typeof error === "object" &&
        "errors" in error &&
        Array.isArray((error as { errors: unknown[] }).errors)
      ) {
        console.error(
          "OAuth SignIn Error:",
          (error as { errors: unknown[] }).errors
        );
      } else {
        console.error("OAuth SignIn Error:", error);
      }
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
