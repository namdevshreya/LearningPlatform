import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("ascent_user");
    const token = localStorage.getItem("ascent_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setBooting(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ascent_token", data.token);
    localStorage.setItem("ascent_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
    // backend register doesn't return a token, so log in right after
    return login(payload.email, payload.password);
  };

  const logout = () => {
    localStorage.removeItem("ascent_token");
    localStorage.removeItem("ascent_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, booting }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
