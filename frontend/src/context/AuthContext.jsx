import React, { useState, useEffect, useCallback } from "react";
import { getProfile, getToken, removeToken, saveToken, login as authLogin, register as authRegister } from "../services/auth";
import { AuthContext } from "./useAuth";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verifyToken = useCallback(async (token) => {
    try {
      const profile = await getProfile(token);
      setUser(profile);
      setError(null);
    } catch (err) {
      removeToken();
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [verifyToken]);

  const login = useCallback(async (username, password) => {
    try {
      setError(null);
      const { token, user: userData } = await authLogin(username, password);
      saveToken(token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (username, password, fullName) => {
    try {
      setError(null);
      const response = await authRegister(username, password, fullName);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
