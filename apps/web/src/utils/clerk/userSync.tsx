import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export const useSyncUser = () => {
  const { user, isSignedIn } = useUser();
  const { fetchUser, userData } = useAuth();

  useEffect(() => {
    const sync = async () => {
      if (!user) return;

      type DbUser = {
        email: string;
        firstName: string | null;
        lastName: string | null;
        clerkId: string;
        imgUrl?: string;
      };

      const dbObj: DbUser = {
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        clerkId: user.id,
      };

      if (user.hasImage) {
        dbObj.imgUrl = user.imageUrl;
      }

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/clerk-sync`,
          dbObj,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true, // send cookies
          }
        );

        // Optional: log response for debugging
        console.log("User sync response:", res.data);

        // Trigger your backend to set HttpOnly cookies (e.g., JWT)
        await axios.get("/api/auth/set-token");

        // Fetch the synced user from your backend and store in context
        await fetchUser();

        console.log("saved state : " + userData)
      } catch (err) {
        console.error("Error syncing user:", err);
      }
    };

    if (isSignedIn) {
      sync();
    }
  }, [user, isSignedIn]);
};
