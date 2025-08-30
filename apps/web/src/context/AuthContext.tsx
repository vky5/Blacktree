"use client";

import { createContext, useState, useContext, useEffect, useRef } from "react";
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
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false); // Track if fetchUser already ran

  const fetchUser = async () => {
    if (fetchedRef.current) return; // Prevent multiple fetches
    fetchedRef.current = true;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
        { withCredentials: true }
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // Run fetchUser only once on mount
  useEffect(() => {
    fetchUser();
  }, []);

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
