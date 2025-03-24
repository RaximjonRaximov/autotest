import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // On app initialization, check localStorage for an existing token and restore user state
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if the token is expired
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (decoded.exp < currentTime) {
          // Token is expired, clear localStorage and set user to null
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
        } else {
          // Token is valid, restore user state
          setUser({
            role: decoded.role,
            user_id: decoded.user_id,
            phone_number: decoded.phone_number, // If phone_number is in the token
          });
        }
      } catch (error) {
        console.error("Token dekod qilishda xato:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      }
    }
  }, []); // Empty dependency array to run only on mount

  const login = ({ access, refresh, user_id, email, phone_number }) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    const decoded = jwtDecode(access);
    setUser({
      role: decoded.role,
      user_id,
      phone_number,
    });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const getRole = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if the token is expired
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (decoded.exp < currentTime) {
          // Token is expired, clear localStorage and return null
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
          return null;
        }
        return decoded.role;
      } catch (error) {
        console.error("Token dekod qilishda xato:", error);
        return null;
      }
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);