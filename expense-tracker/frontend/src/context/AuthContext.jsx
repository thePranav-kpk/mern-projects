/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1.Auto-login on Page Refresh
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token is invalid or expired
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.log("Auto-login error: ", error);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  // 2.Login function
  const login = async (email, password) => {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || "Login failed");
    }
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  // 3.Register function
  const register = async (name, email, password) => {
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || "Registraton failed");
    }
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return;
  };

  // 4.Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
