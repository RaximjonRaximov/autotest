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
        console.log('Decoded Token:', decoded); // Debug: Log the decoded token
        // Check if the token is expired
        const currentTime = Date.now() / 1000; // Current time in seconds
        if (decoded.exp < currentTime) {
          // Token is expired, clear localStorage and set user to null
          console.log('Token expired, clearing localStorage');
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
        } else {
          // Token is valid, restore user state
          const newUser = {
            role: decoded.role.toLowerCase(), // Normalize role to lowercase
            user_id: decoded.user_id,
            phone_number: decoded.phone_number, // If phone_number is in the token
          };
          console.log('Setting user:', newUser); // Debug: Log the user being set
          setUser(newUser);
        }
      } catch (error) {
        console.error("Token dekod qilishda xato:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      }
    } else {
      console.log('No access token found in localStorage');
    }
  }, []); // Empty dependency array to run only on mount

  const login = ({ access, refresh, user_id, email, phone_number }) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    const decoded = jwtDecode(access);
    const newUser = {
      role: decoded.role.toLowerCase(), // Normalize role to lowercase
      user_id,
      phone_number,
    };
    setUser(newUser);
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
        const role = decoded.role.toLowerCase();
        return role;
      } catch (error) {
        console.error("Token dekod qilishda xato:", error);
        return null;
      }
    }
    console.log('No token found in getRole');
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);