import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "../api/axios";
import LoadingScreen from "./LoadingScreen";
import { useAuth } from "../hooks/useAuth"; // Adjust path to your Auth Context

export default function GuestRoute() {
  // 1. Pull auth state and setters from your global Auth Context
  const { 
    isAuthenticated, 
    loadingData, 
    setLoadingData, 
    setToken, 
    setRole, 
    setPublicId 
  } = useAuth();

  // 2. Define the ref to prevent duplicate concurrent refresh requests
  const isRefreshingRef = useRef(false);

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
        // If refresh fails (invalid/missing cookie), clear session data
        setToken(null);
        setRole(null);
        setPublicId(null);
      } finally {
        // Stop the loading screen once verification finishes
        if (setLoadingData) setLoadingData(false);
        isRefreshingRef.current = false; // Release the lock
      }
    };

    verifyAndRefreshToken();
  }, [setToken, setRole, setPublicId, setLoadingData]);

  // 3. Wait until the global provider finishes checking the session
  if (loadingData) {
    return <LoadingScreen />;
  }

  // 4. If the user is already logged in, redirect them away from login/register pages
  if (isAuthenticated) {
    return <Navigate to="/userDashboard" replace />;
  }
  
  // 5. If they are a guest (not logged in), render <Outlet /> so <Login /> or <Register /> displays
  return <Outlet />;
}