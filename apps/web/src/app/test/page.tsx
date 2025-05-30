
"use client";
import axios from "axios";
import React, { useEffect } from "react";

function page() {
  const [userData, setUserData] = React.useState([]);
  useEffect(() => {
    const func = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
        {
          withCredentials: true,
        }
      );

      setUserData(res.data);
    };
    func();
  }, []);

  return (
    <div>
      {userData && typeof userData === "object" ? (
        <pre>{JSON.stringify(userData, null, 2)}</pre>
      ) : (
        userData
      )}
    </div>
  );
}

export default page;
