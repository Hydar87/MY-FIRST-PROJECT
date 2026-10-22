import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "../../api/axios"; // Adjust path to your axios instance

const PROFILE_URL = "/api/users/profile/read"; // Adjust to your actual backend endpoint for fetching profile

const UserDashboard = () => {
  const { logout, isStaff, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(PROFILE_URL, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        // Expecting response structure: { success: true, profile: { ... } }
        if (response?.data?.success) {
          setProfile(response.data.profile);
        } else {
          setError("Failed to load profile data.");
        }
      } catch (err) {
        setError("An error occurred while fetching your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>User Dashboard</h2>
        <button 
          onClick={handleLogout}
          style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Logout
        </button>
      </header>

      {/* Conditionally rendered link for staff/moderators */}
      {isStaff && (
        <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#e9ecef", borderRadius: "4px" }}>
          <Link to="/adminDashboard" style={{ color: "#007bff", fontWeight: "bold", textDecoration: "none" }}>
            👉 Go to Admin / Moderator Panel
          </Link>
        </div>
      )}

      {profile && (
        <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
          <h3>Welcome, {profile.username}!</h3>
          <p><strong>Public ID:</strong> {profile.public_id}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Account Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;