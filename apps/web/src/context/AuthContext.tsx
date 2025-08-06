"use client";

import { createContext, useState, useContext } from "react";
import axios from "axios";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  github_connect: boolean;
};

interface AuthContextType {
  fetchUser: () => Promise<void>;
  userData: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
        {
          withCredentials: true,
        },
      );

      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ fetchUser, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
