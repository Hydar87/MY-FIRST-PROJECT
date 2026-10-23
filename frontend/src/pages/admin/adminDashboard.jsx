import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Calendar, 
  Key, 
  UserPlus, 
  Moon, 
  Sun,
  X,
  AlertCircle
} from 'lucide-react';

// Sample mock response matching your backend structure
const INITIAL_API_DATA = {
  "success": true,
  "data": {
    "users": [
      {
        "public_id": "188a9e7c-af63-4fc7-aea5-920ae6957a2f",
        "email": "zumz5289@gmail.com",
        "username": "zumz",
        "created_at": "2026-10-22T08:22:53.504Z",
        "active": 1,
        "role": "user"
      },
      {
        "public_id": "5a28f653-43a6-49a9-bef6-fc4c3017aa63",
        "email": "idi@gmail.com",
        "username": "iddii",
        "created_at": "2026-10-21T14:28:41.530Z",
        "active": 1,
        "role": "user"
      },
      {
        "public_id": "dec21232-7252-4762-8997-bfef6cbd656a",
        "email": "idd@gmail.com",
        "username": "iddi",
        "created_at": "2026-10-21T14:10:33.820Z",
        "active": 1,
        "role": "user"
      },
      {
        "public_id": "206dc7d0-0fb1-4615-845c-89a7d41e3386",
        "email": "kondoo1@gmail.com",
        "username": "kondoo1",
        "created_at": "2026-10-19T22:33:29.968Z",
        "active": 1,
        "role": "user"
      },
      {
        "public_id": "6ef191f4-2ce3-45f4-bd9b-a685661989b7",
        "email": "gajaniarts@gmail.com",
        "username": "gajaniart",
        "created_at": "2026-10-19T22:22:19.894Z",
        "active": 1,
        "role": "user"
      },
      {
        "public_id": "5399b774-8cc2-41a2-b5da-5324e58fc9cc",
        "email": "hydarnyawa@gmail.com",
        "username": "Nyawa",
        "created_at": "2026-10-19T16:30:30.070Z",
        "active": 1,
        "role": "admin"
      },
      {
        "public_id": "83a21d91-192d-42ea-80f9-0afd83354e33",
        "email": "hydarzuma87@gmail.com",
        "username": "hydar1234",
        "created_at": "2026-10-19T16:13:25.077Z",
        "active": 1,
        "role": "admin"
      },
      {
        "public_id": "4c764d7f-7fea-421f-a34c-63bbeee0f19a",
        "email": "hydarous87@gmail.com",
        "username": "hydarous87",
        "created_at": "2026-10-16T08:33:13.926Z",
        "active": 1,
        "role": "admin"
      },
      {
        "public_id": "db404ed8-6f23-409f-ab4e-cc81be6f1d50",
        "email": "ummi@gmail.com",
        "username": "ummi",
        "created_at": "2026-10-16T06:17:58.669Z",
        "active": 1,
        "role": null
      },
      {
        "public_id": "e7210228-bd97-4d8e-a365-08f499217645",
        "email": "babu@gmail.com",
        "username": "Babu",
        "created_at": "2026-10-12T16:56:30.024Z",
        "active": 0,
        "role": null
      }
    ],
    "pagination": {
      "totalUsers": 30,
      "currentPage": 1,
      "totalPages": 3,
      "pageSize": 10
    }
  }
};

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);

  // Core Data State initialized with sample JSON
  const [userData, setUserData] = useState(INITIAL_API_DATA.data.users);
  const [pagination, setPagination] = useState(INITIAL_API_DATA.data.pagination);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Active Modals State
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view' | 'edit' | 'add' | 'delete'

  // Edit Form state
  const [editForm, setEditForm] = useState({ role: '', active: 1 });

  // Add New User Form state
  const [addForm, setAddForm] = useState({ username: '', email: '', role: 'user', active: 1 });

  // Notification Banner
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper date formatter
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Compute Stat Card summaries
  const stats = useMemo(() => {
    const total = userData.length;
    const active = userData.filter(u => Number(u.active) === 1).length;
    const admins = userData.filter(u => u.role === 'admin').length;
    const regularUsers = userData.filter(u => u.role === 'user').length;
    const unassigned = userData.filter(u => !u.role).length;

    return { total, active, admins, regularUsers, unassigned };
  }, [userData]);

  // Client-side Filter Logic
  const filteredUsers = useMemo(() => {
    return userData.filter(user => {
      // Search Matching
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.public_id.toLowerCase().includes(searchTerm.toLowerCase());

      // Role Matching
      const matchesRole = 
        roleFilter === 'all' || 
        (roleFilter === 'unassigned' ? !user.role : user.role === roleFilter);

      // Status Matching
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && Number(user.active) === 1) ||
        (statusFilter === 'inactive' && Number(user.active) === 0);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [userData, searchTerm, roleFilter, statusFilter]);

  // Action Handlers
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ role: user.role || 'unassigned', active: user.active });
    setModalType('edit');
  };

  const handleOpenView = (user) => {
    setSelectedUser(user);
    setModalType('view');
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setModalType('delete');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setUserData(prev => prev.map(u => {
      if (u.public_id === selectedUser.public_id) {
        return {
          ...u,
          role: editForm.role === 'unassigned' ? null : editForm.role,
          active: Number(editForm.active)
        };
      }
      return u;
    }));
    showToast(`User ${selectedUser.username} updated successfully!`);
    setModalType(null);
  };

  const handleToggleActiveQuick = (user) => {
    const updatedStatus = Number(user.active) === 1 ? 0 : 1;
    setUserData(prev => prev.map(u => u.public_id === user.public_id ? { ...u, active: updatedStatus } : u));
    showToast(`Status updated for ${user.username}`);
  };

  const handleDeleteUser = () => {
    setUserData(prev => prev.filter(u => u.public_id !== selectedUser.public_id));
    showToast(`User ${selectedUser.username} removed.`, 'danger');
    setModalType(null);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const newUser = {
      public_id: crypto.randomUUID(),
      username: addForm.username,
      email: addForm.email,
      created_at: new Date().toISOString(),
      active: Number(addForm.active),
      role: addForm.role === 'unassigned' ? null : addForm.role
    };

    setUserData([newUser, ...userData]);
    setAddForm({ username: '', email: '', role: 'user', active: 1 });
    showToast('New user registered successfully!');
    setModalType(null);
  };

  // Mock API Refresh
  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Dashboard data re-synced with backend');
    }, 600);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-200 font-sans`}>
      {/* Top Navbar */}
      <header className={`border-b ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md sticky top-0 z-30 px-6 py-4 transition-colors`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
              <p className="text-xs text-slate-400">Manage platform users, roles, and system access</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefreshData}
              disabled={loading}
              className={`p-2.5 rounded-lg border transition-all ${
                darkMode 
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-300 hover:bg-slate-100 text-slate-600'
              }`}
              title="Sync with Backend"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-lg border transition-all ${
                darkMode 
                  ? 'border-slate-700 hover:bg-slate-800 text-amber-400' 
                  : 'border-slate-300 hover:bg-slate-100 text-indigo-600'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button 
              onClick={() => setModalType('add')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Toast Alert */}
        {toast && (
          <div className={`p-4 rounded-xl shadow-xl flex items-center gap-3 border ${
            toast.type === 'danger' 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className={`p-5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total System Users</span>
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">{stats.total}</span>
              <span className="text-xs text-slate-400">registered</span>
            </div>
          </div>

          {/* Card 2: Active Users */}
          <div className={`p-5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Accounts</span>
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-emerald-500">{stats.active}</span>
              <span className="text-xs text-slate-400">({Math.round((stats.active / (stats.total || 1)) * 100)}% active)</span>
            </div>
          </div>

          {/* Card 3: Administrators */}
          <div className={`p-5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admins</span>
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-purple-400">{stats.admins}</span>
              <span className="text-xs text-slate-400">privileged roles</span>
            </div>
          </div>

          {/* Card 4: Regular Users */}
          <div className={`p-5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Standard Users</span>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-amber-500">{stats.regularUsers}</span>
              <span className="text-xs text-slate-400">({stats.unassigned} unassigned)</span>
            </div>
          </div>
        </div>

        {/* Search, Filters and Control Toolbar */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by username, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                darkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`px-3 py-2 text-sm rounded-xl border outline-none cursor-pointer ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="unassigned">Unassigned (Null)</option>
              </select>
            </div>

            {/* Status Filter */}
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 text-sm rounded-xl border outline-none cursor-pointer ${
                darkMode 
                  ? 'bg-slate-950 border-slate-800 text-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'border-slate-800 bg-slate-950/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}>
                  <th className="py-4 px-6">User Info</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className={`divide-y text-sm ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isActive = Number(user.active) === 1;

                    return (
                      <tr 
                        key={user.public_id}
                        className={`transition-colors ${
                          darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* User & ID */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                              user.role === 'admin' 
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            }`}>
                              {user.username.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200 dark:text-slate-100 flex items-center gap-1.5">
                                {user.username}
                              </div>
                              <div className="text-xs font-mono text-slate-500 truncate max-w-[160px]" title={user.public_id}>
                                {user.public_id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 text-slate-300 dark:text-slate-300">
                          {user.email}
                        </td>

                        {/* Role Pill */}
                        <td className="py-4 px-6">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Admin
                            </span>
                          ) : user.role === 'user' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Users className="w-3.5 h-3.5" />
                              User
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Active Status */}
                        <td className="py-4 px-6">
                          <button 
                            onClick={() => handleToggleActiveQuick(user)}
                            className="group flex items-center gap-1.5 cursor-pointer"
                            title="Click to toggle status"
                          >
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20">
                                <XCircle className="w-3.5 h-3.5" />
                                Inactive
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-6 text-slate-400 text-xs">
                          {formatDate(user.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleOpenView(user)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                              title="Edit Role & Access"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenDelete(user)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      No users match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
            darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
          }`}>
            <div>
              Showing <span className="font-semibold text-slate-200 dark:text-slate-100">{filteredUsers.length}</span> of{' '}
              <span className="font-semibold text-slate-200 dark:text-slate-100">{pagination.totalUsers}</span> users
            </div>

            <div className="flex items-center gap-2">
              <button 
                disabled={pagination.currentPage <= 1}
                onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
                className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-medium bg-slate-800 rounded-md">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button 
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
                className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* VIEW USER DETAILS MODAL */}
      {modalType === 'view' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setModalType(null)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-4">User Details</h3>

            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 font-mono">PUBLIC_ID</span>
                <p className="font-mono text-xs text-indigo-400 break-all">{selectedUser.public_id}</p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <Users className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-500">Username</span>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-500">Email</span>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-xs text-slate-500">Registration Date</span>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-slate-500 block mb-1">Raw JSON Payload</span>
                <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedUser, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ROLE & STATUS MODAL */}
      {modalType === 'edit' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button onClick={() => setModalType(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1">Edit User Access</h3>
            <p className="text-xs text-slate-400 mb-4">Modify permissions for {selectedUser.username}</p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Role Assignment</label>
                <select 
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="unassigned">Unassigned (null)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Account Active Status</label>
                <select 
                  value={editForm.active}
                  onChange={(e) => setEditForm({ ...editForm, active: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>1 - Active</option>
                  <option value={0}>0 - Inactive / Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)} 
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {modalType === 'add' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button onClick={() => setModalType(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1">Add New User</h3>
            <p className="text-xs text-slate-400 mb-4">Create a new user account manually</p>

            <form onSubmit={handleAddUser} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Username</label>
                <input 
                  type="text" 
                  required
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  placeholder="e.g. john_doe"
                  className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Role</label>
                  <select 
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-200 outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Status</label>
                  <select 
                    value={addForm.active}
                    onChange={(e) => setAddForm({ ...addForm, active: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-200 outline-none"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/30">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {modalType === 'delete' && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl relative text-center ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold mb-1">Delete User?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to delete <span className="text-slate-200 font-semibold">{selectedUser.username}</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setModalType(null)} 
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}