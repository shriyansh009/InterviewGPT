/**
 * Auth Context for managing user authentication state
 */

import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Optionally verify token with backend
      setUser({ authenticated: true });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.signIn(email, password);
      setUser({ ...result.user, authenticated: true });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, full_name, username) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.signUp(email, password, full_name, username);
      setUser({ ...result.user, authenticated: true });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
