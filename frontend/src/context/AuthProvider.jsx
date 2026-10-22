import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [publicId, setPublicId] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // 🔒 Ref lock to prevent concurrent/duplicate refresh requests
  const isRefreshingRef = useRef(false);

  const isAuthenticated = Boolean(token);
  const isStaff = ["admin", "moderator", "technician"].includes(role);

  useEffect(() => {
    const verifyAndRefreshToken = async () => {
      // If a refresh is already in flight, exit immediately
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        const response = await axios.post(
          "/api/auth/refresh", 
          {}, 
          { withCredentials: true }
        );

        const newAccessToken = response?.data?.accessToken;
        const userRole = response?.data?.user?.role;
        const userPublicId = response?.data?.user?.publicId;

        if (newAccessToken) {
          setToken(newAccessToken);
          setRole(userRole ?? null);
          setPublicId(userPublicId ?? null);
        }
      } catch (err) {
        // If refresh fails (invalid/missing cookie), log out
        setToken(null);
        setRole(null);
        setPublicId(null);
      } finally {
        setLoadingData(false);
        isRefreshingRef.current = false; // Release the lock
      }
    };

    verifyAndRefreshToken();
  }, []);

  const login = (accessToken, userRole, userPublicId) => {
    if (!accessToken) {
      throw new Error("Login response did not contain an access token.");
    }
    setToken(accessToken);
    setRole(userRole ?? null);
    setPublicId(userPublicId ?? null);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setPublicId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        publicId,
        isStaff,
        isAuthenticated,
        login,
        logout,
        loadingData,
        setLoadingData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};

export default AuthContext; 
