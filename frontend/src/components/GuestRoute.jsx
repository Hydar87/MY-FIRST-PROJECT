
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom"; // 1. Import Outlet
import axios from "../api/axios";
import LoadingScreen from "./LoadingScreen";

export default function GuestRoute() { // 2. Removed { children } prop
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      try {
        const response = await axios.post(
          "/api/auth/refresh", 
          {}, 
          { 
            withCredentials: true,
            signal: controller.signal,
          }
        );
 
        if (response.status >= 200 && response.status < 300) {
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          if (error.response && error.response.status === 401) {
            setStatus("unauthenticated"); 
          } else {
            setStatus("error"); 
          }
        }
      }
    }

    checkSession();

    return () => controller.abort();
  }, []);

  if (status === "checking") {
     return <LoadingScreen />;
      }

  if (status === "authenticated") {
    return <Navigate to="/userDashboard" replace />;
  }

  if (status === "error") {
    {/*return <p>Unable to verify your session. Please try again.</p>;*/}
     return <LoadingScreen />;
  }
  
  // 3. Render <Outlet /> so <Login /> or <Register /> displays correctly
  return <Outlet />;
}