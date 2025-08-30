import { useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { getJWT } from "../getToken";

export const useSyncUser = () => {
  const { user, isSignedIn } = useUser();
  const { fetchUser } = useAuth();
  const syncedRef = useRef(false); // prevent multiple syncs

  const sync = useCallback(async () => {
    if (!user || syncedRef.current) return;

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
      console.log("Syncing user with backend..."); // debug log
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
      // Get token from API
      const tokenRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/get-token`,
        {
          withCredentials: true,
        }
      );
      const jwtToken = tokenRes.data.token; // <-- this is the actual JWT

      // Send to backend to set HttpOnly cookie
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/set-token`,
        {
          jwt: jwtToken,
        },
        { withCredentials: true }
      );

      // Fetch the synced user from your backend and store in context
      await fetchUser();

      syncedRef.current = true; // mark synced
    } catch (err) {
      console.error("Error syncing user:", err);
    }
  }, [user, fetchUser]);

  useEffect(() => {
    if (isSignedIn) {
      console.log("User is signed in, starting sync..."); // debug log
      sync();
    }
  }, [isSignedIn, sync]);
};
