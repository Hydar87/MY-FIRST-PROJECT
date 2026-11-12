import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "../../api/axios";

const ALL_PROFILE_URL = "/api/admin/getUsersProfile/read";

const UserDashboard = () => {
  const { logout, isStaff, token } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Page Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${ALL_PROFILE_URL}?page=${currentPage}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          signal: controller.signal,
        });

        if (response?.data?.success && isMounted) {
          // Extract data matching exact backend shape
          setAllUsers(response.data.data.users || []);
          setPagination(response.data.data.pagination || null);
          setError("");
        } else if (isMounted) {
          setError("Failed to load user profile data.");
        }
      } catch (err) {
        if (err.name !== "CanceledError" && isMounted) {
          console.error("Fetch Error:", err);
          setError(
            err.response?.data?.message || "An error occurred while fetching profiles."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfiles();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token, currentPage]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Filter Users in Current Page View
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(allUsers)) return [];

    return allUsers.filter((user) => {
      const nameMatch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const userRole = (user.role || "user").toLowerCase();
      const matchesRole =
        roleFilter === "ALL"
          ? true
          : roleFilter === "ADMIN"
          ? userRole === "admin"
          : roleFilter === "USER"
          ? userRole === "user" || user.role === null
          : true;

      return nameMatch && matchesRole;
    });
  }, [allUsers, searchTerm, roleFilter]);

  // Quick stats computed from current view / pagination metadata
  const totalUsersInDB = pagination?.totalUsers || 0;
  const adminCount = allUsers.filter((u) => u.role === "admin").length;
  const regularUserCount = allUsers.filter((u) => u.role === "user" || u.role === null).length;

  if (loading && allUsers.length === 0) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: "12px", color: "#64748b" }}>Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerContainer}>
        <div style={{ color: "#ef4444", fontWeight: "600", fontSize: "1.1rem" }}>{error}</div>
        <button style={styles.retryBtn} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Top Header */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>User Management Portal</h2>
          <p style={styles.subtitle}>Overview of system accounts and active profiles</p>
        </div>
        <div style={styles.userSection}>
          <span style={styles.badge}>
            {isStaff ? "Staff / Admin Access" : "Standard Access"}
          </span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* KPI Stats Cards */}
      <section style={styles.statsGrid}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Total Registered Users</span>
          <span style={styles.cardVal}>{totalUsersInDB}</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Admins (Page View)</span>
          <span style={{ ...styles.cardVal, color: "#2563eb" }}>{adminCount}</span>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Users / Guest (Page View)</span>
          <span style={{ ...styles.cardVal, color: "#059669" }}>{regularUserCount}</span>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        {/* Search & Filter Bar */}
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Search username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Role Filter:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={styles.selectInput}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admins Only</option>
              <option value="USER">Users / Unassigned</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Public ID</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const role = user.role || "Unassigned";
                  const isActive = user.active === 1;

                  return (
                    <tr key={user.public_id} style={styles.tableRow}>
                      <td style={{ ...styles.td, fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>
                        {user.public_id.slice(0, 8)}...
                      </td>
                      <td style={styles.td}>
                        <div style={styles.userCell}>
                          <div style={styles.avatar}>
                            {(user.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: "600", color: "#0f172a" }}>
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.roleBadge,
                            ...(role === "admin"
                              ? styles.adminBadge
                              : role === "user"
                              ? styles.userBadge
                              : styles.noneBadge),
                          }}
                        >
                          {role}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={isActive ? styles.activeDot : styles.inactiveDot}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => navigate(`/admin/users/${user.public_id}`)}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={styles.noDataCell}>
                    {loading ? "Refreshing results..." : "No users match your criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Backend Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div style={styles.paginationBar}>
            <span style={styles.pageInfo}>
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalUsers} total users)
            </span>
            <div style={styles.pageControls}>
              <button
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <button
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === pagination.totalPages ? 0.5 : 1,
                  cursor: currentPage === pagination.totalPages ? "not-allowed" : "pointer",
                }}
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Inline Styling Object
const styles = {
  wrapper: {
    padding: "2rem",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  centerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    backgroundColor: "#ffffff",
    padding: "1.25rem 1.5rem",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#0f172a",
  },
  subtitle: {
    margin: "4px 0 0 0",
    color: "#64748b",
    fontSize: "0.875rem",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  badge: {
    padding: "4px 10px",
    backgroundColor: "#e2e8f0",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#334155",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "1.25rem",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardLabel: {
    fontSize: "0.875rem",
    color: "#64748b",
    fontWeight: "500",
  },
  cardVal: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#0f172a",
  },
  mainContent: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  searchInput: {
    padding: "10px 14px",
    width: "300px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    outline: "none",
    fontSize: "0.9rem",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "0.875rem",
    color: "#475569",
    fontWeight: "500",
  },
  selectInput: {
    padding: "8px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "0.9rem",
    outline: "none",
    backgroundColor: "#fff",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHeadRow: {
    borderBottom: "2px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  th: {
    padding: "12px",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableRow: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "14px 12px",
    fontSize: "0.9rem",
    color: "#334155",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
  },
  roleBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  adminBadge: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  userBadge: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  noneBadge: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  activeDot: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  inactiveDot: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  actionBtn: {
    padding: "6px 12px",
    backgroundColor: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    fontSize: "0.8rem",
    cursor: "pointer",
    fontWeight: "500",
    color: "#334155",
  },
  noDataCell: {
    textAlign: "center",
    padding: "2rem",
    color: "#94a3b8",
  },
  paginationBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e2e8f0",
  },
  pageInfo: {
    fontSize: "0.875rem",
    color: "#64748b",
  },
  pageControls: {
    display: "flex",
    gap: "8px",
  },
  pageBtn: {
    padding: "6px 14px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: "500",
    color: "#334155",
  },
  retryBtn: {
    marginTop: "12px",
    padding: "8px 16px",
    backgroundColor: "#0284c7",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default UserDashboard;