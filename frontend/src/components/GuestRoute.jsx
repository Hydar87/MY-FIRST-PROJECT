import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../api/axios";

export default function GuestRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
            try {
              const response = await axios.post(
                "/api/auth/refresh", 
                {}, 
                { withCredentials: true ,
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
          setStatus("error");
        }
      }
    }

    checkSession();

    return () => controller.abort();
  }, []);

  if (status === "checking") {
    return <p>Checking session...</p>;
  }

  if (status === "authenticated") {
    return <Navigate to="/userDashboard" replace />;
  }

  if (status === "error") {
    return <p>Unable to verify your session. Please try again.</p>;
  }

  return children;
}