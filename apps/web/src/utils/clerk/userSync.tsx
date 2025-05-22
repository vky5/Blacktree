import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export const useSyncUser = () => {
  const { user, isSignedIn } = useUser();

  // this useEffect is to sync the data that we get from clerk to our own DB
  useEffect(() => {
    const sync = async () => {
      if (!user) return;

      // defining the type of db user
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

      console.log(user);
      if (user.hasImage === true) {
        dbObj.imgUrl = user.imageUrl;
      }

      
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/clerk-sync`,
        dbObj,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    };
    if (isSignedIn) {
      sync();
    }
  }, [user, isSignedIn]);
};
