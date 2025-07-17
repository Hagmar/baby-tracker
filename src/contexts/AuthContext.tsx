import React, { createContext, useContext, useState, useEffect } from "react";
import { getApiUrl } from "../utils/storage";

interface Baby {
  name: string;
}

interface User {
  username: string;
}

export const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: User | null;
  baby: Baby | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    babyName: string,
    dateOfBirth: string,
    invitationCode: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}>({
  isAuthenticated: false,
  user: null,
  baby: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [baby, setBaby] = useState<Baby | null>(null);

  useEffect(() => {
    // Check session on mount
    fetch(getApiUrl("check-session"), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          setUser(data.user);
          setBaby(data.baby);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
        setBaby(null);
      });
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch(getApiUrl("login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    // Get updated session info
    const sessionResponse = await fetch(getApiUrl("check-session"), {
      credentials: "include",
    });
    const sessionData = await sessionResponse.json();

    setIsAuthenticated(true);
    setUser(sessionData.user);
    setBaby(sessionData.baby);
  };

  const register = async (
    username: string,
    password: string,
    babyName: string,
    dateOfBirth: string,
    invitationCode: string
  ) => {
    const response = await fetch(getApiUrl("register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        babyName,
        dateOfBirth,
        invitationCode,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }
  };

  const logout = async () => {
    await fetch(getApiUrl("logout"), {
      method: "POST",
      credentials: "include",
    });
    setIsAuthenticated(false);
    setUser(null);
    setBaby(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, baby, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
