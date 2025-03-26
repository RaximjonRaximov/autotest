import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { cartActions } from "../store"; // Redux actions import qilinadi
import store from "../store"; // Redux store import qilinadi

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded Token:', decoded);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.log('Token expired, clearing localStorage');
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
          store.dispatch(cartActions.setRole_id(null)); // Token eskirgan bo'lsa role_id ni null qilamiz
        } else {
          const newUser = {
            role: decoded.role.toLowerCase(),
            user_id: decoded.user_id,
            phone_number: decoded.phone_number,
          };
          console.log('Setting user:', newUser);
          setUser(newUser);
          // Redux store'ga role_id ni saqlaymiz
          store.dispatch(cartActions.setRole_id(decoded.role.toLowerCase()));
        }
      } catch (error) {
        console.error("Token dekod qilishda xato:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        store.dispatch(cartActions.setRole_id(null));
      }
    } else {
      console.log('No access token found in localStorage');
    }
    setIsLoading(false);
  }, []);

  const login = ({ access, refresh, user_id, email, phone_number }) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    const decoded = jwtDecode(access);
    const newUser = {
      role: decoded.role.toLowerCase(),
      user_id,
      phone_number,
    };
    console.log('Login - Setting user:', newUser);
    setUser(newUser);
    // Redux store'ga role_id ni saqlaymiz
    store.dispatch(cartActions.setRole_id(decoded.role.toLowerCase()));
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    store.dispatch(cartActions.setRole_id(null)); // Logoutda role_id ni null qilamiz
    setIsLoading(false);
  };

  const getRole = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
          store.dispatch(cartActions.setRole_id(null));
          return null;
        }
        return decoded.role.toLowerCase();
      } catch (error) {
        console.error("Token dekod qilishda xato:", error);
        return null;
      }
    }
    console.log('No token found in getRole');
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);