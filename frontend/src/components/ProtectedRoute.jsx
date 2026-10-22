
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const ProtectedRoute = () => {
  const { isAuthenticated, loadingData } = useAuth();

  // 1. While the app is checking the cookie in the background, show a loader (prevents premature redirects)
  if (loadingData) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh' }}>Loading session...</div>;
  }

  // 2. Once loading is done, if not authenticated, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;