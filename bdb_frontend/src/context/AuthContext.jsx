import { createContext, useContext, useState, useCallback } from "react";
import { login as apiLogin, logout as apiLogout } from "../api/auth";
import { getErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("bdb_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [counter, setCounter] = useState(() => {
    const stored = localStorage.getItem("bdb_counter");
    return stored ? JSON.parse(stored) : null;
  });

  const signIn = useCallback(async (username, password) => {
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("bdb_user", JSON.stringify(data.user));
      if (data.counter) localStorage.setItem("bdb_counter", JSON.stringify(data.counter));
      setUser(data.user);
      setCounter(data.counter || null);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, "Unable to log in. Please try again.") };
    }
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("bdb_user");
    localStorage.removeItem("bdb_counter");
    setUser(null);
    setCounter(null);
  }, []);

  const isSupervisorOrAdmin = user?.role === "supervisor" || user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, counter, signIn, signOut, isSupervisorOrAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
