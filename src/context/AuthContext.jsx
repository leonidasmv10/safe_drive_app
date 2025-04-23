import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Aquí podrías validar el token o cargar información del usuario
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    localStorage.setItem("token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    setUser({ token: data.access });
    return data;
  };

  const logout = async () => {
    try {
      // Intentar hacer logout en el servidor
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (token && refreshToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/user/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Error en logout del servidor:", error);
    } finally {
      // Limpiar siempre el estado local
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      
      // Limpiar otros datos de la aplicación
      localStorage.removeItem('sound_detections');
      
      // Forzar recarga de la página para limpiar todos los estados
      window.location.href = '/';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
