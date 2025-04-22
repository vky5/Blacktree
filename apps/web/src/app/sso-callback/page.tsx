"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useUser,
  useAuth,
  AuthenticateWithRedirectCallback,
} from "@clerk/nextjs";
import axios from "axios";

export default function SSOCallbackPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useAuth();

  // Function to sync user with backend
  const syncUser = async () => {
    if (!user) {
      console.error("No user available for sync");
      return;
    }

    try {
      console.log("Attempting to sync user:", user.id);
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/clerk-sync`,
        {
          email: user.emailAddresses[0].emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          clerkUserId: user.id,
        }
      );
      console.log("User synced successfully");
    } catch (error) {
      console.error("Error syncing user to backend:", error);
    }
  };

  // Handle user sync and redirect after authentication is complete
  useEffect(() => {
    if (userLoaded && isSignedIn && user) {
      syncUser()
        .then(() => {
          router.push("/");
        })
        .catch((error) => {
          console.error("Error during sync or redirect:", error);
          router.push("/?error=sync_failed");
        });
    }
  }, [userLoaded, isSignedIn, user, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <AuthenticateWithRedirectCallback
        signInUrl="/auth/login"
        signUpUrl="/auth/signup"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
      <p>Redirecting...</p>
    </div>
  );
}
