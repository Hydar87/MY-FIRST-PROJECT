import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthProvider";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Save,
  X,
  RefreshCw,
  AlertCircle,
  Code,
  ShieldCheck,
  UserCheck,
  UserX
} from "lucide-react";

const UserDetails = () => {
  const { public_id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "user",
    active: 1
  });

  const getAxiosConfig = () => ({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json"
    }
  });

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${public_id}`,
        getAxiosConfig()
      );

      const resData = response.data;

      if (resData.success && resData.data?.user) {
        setUserData(resData.data.user);
        setFormData({
          username: resData.data.user.username || "",
          email: resData.data.user.email || "",
          role: resData.data.user.role || "user",
          active: resData.data.user.active ?? 1
        });
      } else {
        throw new Error("Invalid response structure from server.");
      }
    } catch (err) {
      console.error("Axios fetch error:", err);
      const message =
        err.response?.data?.message || err.message || "Failed to fetch user details.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (public_id) {
      fetchUserDetails();
    }
  }, [public_id, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${public_id}`,
        formData,
        getAxiosConfig()
      );

      if (response.data.success) {
        setUserData({ ...userData, ...formData });
        setIsEditing(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update user.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    const newStatus = userData.active === 1 ? 0 : 1;
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admin/users/${public_id}/status`,
        { active: newStatus },
        getAxiosConfig()
      );

      if (response.data.success || response.status === 200) {
        setUserData({ ...userData, active: newStatus });
        setFormData((prev) => ({ ...prev, active: newStatus }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to toggle status.";
      alert(msg);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete user "${userData.username}"?`)) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/users/${public_id}`,
        getAxiosConfig()
      );

      alert("User deleted successfully.");
      navigate("/adminDashboard");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to delete user.";
      alert(msg);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900";
      case "moderator":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900";
      case "user":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900">
          <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          Loading user profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link
          to="/adminDashboard"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-6 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <h3 className="text-lg font-semibold">Error Loading User</h3>
          </div>
          <p className="text-sm mb-5 text-rose-700 dark:text-rose-400">{error}</p>
          <button
            onClick={fetchUserDetails}
            className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/adminDashboard"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowJson(!showJson)}
            className="inline-flex items-center px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <Code className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            {showJson ? "Hide Raw JSON" : "View Raw JSON"}
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm shadow-indigo-500/20"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Raw JSON Preview Pane */}
      {showJson && (
        <div className="p-5 bg-slate-950 text-indigo-300 rounded-2xl font-mono text-xs overflow-x-auto shadow-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
            <span>Payload Debugger</span>
            <span>JSON Object</span>
          </div>
          <pre>{JSON.stringify({ success: true, data: { user: userData } }, null, 2)}</pre>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg shadow-indigo-500/25 uppercase flex-shrink-0">
              {userData.username ? userData.username.charAt(0) : "U"}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {userData.username || "Unnamed User"}
                </h1>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(
                    userData.role
                  )}`}
                >
                  {userData.role ? userData.role.toUpperCase() : "NO ROLE"}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                {userData.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800 flex-wrap gap-y-3">
            <button
              onClick={handleToggleActive}
              className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition border shadow-sm ${
                userData.active === 1
                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900"
              }`}
            >
              {userData.active === 1 ? (
                <>
                  <UserX className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" /> Suspend
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" /> Activate
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-medium hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900 transition shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-2 text-rose-600 dark:text-rose-400" /> Delete User
            </button>
          </div>
        </div>
      </div>

      {/* Detail View Grid or Edit Form */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Information Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center">
              <User className="w-4 h-4 mr-2.5 text-indigo-600 dark:text-indigo-400" /> Identity Information
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  Public Unique ID
                </span>
                <p className="font-mono text-xs bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 p-3 rounded-xl mt-1.5 break-all select-all border border-slate-200/60 dark:border-slate-800/80">
                  {userData.public_id}
                </p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  Username
                </span>
                <p className="text-slate-900 dark:text-slate-100 font-semibold mt-1">
                  {userData.username}
                </p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  Email Address
                </span>
                <p className="text-slate-900 dark:text-slate-100 font-semibold mt-1">
                  {userData.email}
                </p>
              </div>
            </div>
          </div>

          {/* Security & System Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2.5 text-indigo-600 dark:text-indigo-400" /> Security & Status
            </h2>

            <div className="space-y-5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 flex items-center font-medium">
                  <Shield className="w-4 h-4 mr-2 text-slate-400" /> Assigned Role
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs">
                  {userData.role || "None"}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Account Status
                </span>
                {userData.active === 1 ? (
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900">
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Suspended
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 flex items-center font-medium">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" /> Created At
                </span>
                <span className="text-slate-800 dark:text-slate-200 text-xs font-semibold">
                  {formatDate(userData.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form Card */
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Edit User Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Modify account attributes and access privileges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Role
              </label>
              <select
                value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all shadow-inner"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Account Status
              </label>
              <select
                value={formData.active}
                onChange={(e) => setFormData({ ...formData, active: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition-all shadow-inner"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive / Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 shadow-sm shadow-indigo-500/20"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserDetails;