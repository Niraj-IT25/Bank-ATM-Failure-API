import React, { useState, useEffect } from "react";
import api from "../api";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "technician", // Default role
    department: "",
    phone: "",
  });

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/auth/all-admins");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. You may not have permission.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.phone && formData.phone.length !== 10) {
      setError("Phone must be 10 digits");
      return;
    }

    try {
      setLoading(true);

      // Create user with specific role
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role, // Send role to backend
      };

      // Add optional fields if provided
      if (formData.department) userData.department = formData.department;
      if (formData.phone) userData.phone = formData.phone;

      const res = await api.post("/admin/auth/register", userData);

      setSuccess(`✓ User "${formData.username}" created successfully as ${formData.role}!`);

      // Add new user to list
      setUsers([...users, res.data.admin]);

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "technician",
        department: "",
        phone: "",
      });

      setShowForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setError(`✗ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        setLoading(true);
        await api.delete(`/admin/auth/${userId}`);
        setUsers(users.filter((u) => u._id !== userId));
        setSuccess(`✓ User "${username}" deleted successfully!`);
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError(`✗ Error: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      super_admin: "#D32F2F", // Red
      admin: "#F57C00", // Orange
      technician: "#1976D2", // Blue
      viewer: "#388E3C", // Green
    };
    return colors[role] || "#666";
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: "🔴 Super Admin",
      admin: "🟠 Admin",
      technician: "🟡 Technician",
      viewer: "🟢 Viewer",
    };
    return labels[role] || role;
  };

  return (
    <div className="user-management-container">
      <div className="user-header">
        <h2>👥 User Management</h2>
        <button
          className="btn-create-user"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? "❌ Cancel" : "➕ Create New User"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Create User Form */}
      {showForm && (
        <div className="user-form-card">
          <h3>📝 Create New User</h3>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="e.g., john_doe"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., john@bank.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 6 characters"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Role * ⭐ SELECT THIS!</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  className="role-select"
                >
                  <option value="viewer">🟢 Viewer (View Only)</option>
                  <option value="technician">🟡 Technician (Can Resolve)</option>
                  <option value="admin">🟠 Admin (Full Access)</option>
                  <option value="super_admin">🔴 Super Admin (All Permissions)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., ATM Support"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone (10 digits)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "phone",
                        value: e.target.value.replace(/\D/g, "").slice(0, 10),
                      },
                    })
                  }
                  placeholder="e.g., 9876543210"
                  disabled={loading}
                  maxLength="10"
                />
              </div>
            </div>

            <div className="role-info">
              <h4>📋 Role Permissions:</h4>
              {formData.role === "super_admin" && (
                <p>Can view, create, edit, resolve, DELETE failures + Manage users + Access all settings</p>
              )}
              {formData.role === "admin" && (
                <p>Can view, create, edit, resolve, DELETE failures + Manage users (No system settings)</p>
              )}
              {formData.role === "technician" && (
                <p>Can view, create, edit, resolve failures (NO delete + NO user management)</p>
              )}
              {formData.role === "viewer" && (
                <p>Can ONLY view failures (Cannot edit, resolve, or delete anything)</p>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Creating..." : "✓ Create User"}
            </button>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="users-list-card">
        <h3>📊 All Users ({users.length})</h3>

        {loading && users.length === 0 ? (
          <p className="loading">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="no-data">No users found. Create your first user!</p>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="col-username">Username</div>
              <div className="col-email">Email</div>
              <div className="col-role">Role</div>
              <div className="col-department">Department</div>
              <div className="col-created">Created</div>
              <div className="col-actions">Actions</div>
            </div>

            {users.map((user) => (
              <div key={user._id} className="table-row">
                <div className="col-username">
                  <strong>{user.username}</strong>
                </div>
                <div className="col-email">{user.email}</div>
                <div className="col-role">
                  <span
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div className="col-department">{user.department || "General"}</div>
                <div className="col-created">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="col-actions">
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteUser(user._id, user.username)}
                    disabled={loading}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
