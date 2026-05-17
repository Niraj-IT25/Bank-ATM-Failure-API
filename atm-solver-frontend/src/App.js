import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import FailureForm from "./components/FailureForm";
import FailureList from "./components/FailureList";
import AdminLogin from "./components/AdminLogin";
import UserManagement from "./components/UserManagement";
import api from "./api";
import "./App.css";

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if admin is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    if (token && user) {
      // Set token in API headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAdminLoggedIn(true);
      setAdminUser(JSON.parse(user));
    }

    setLoading(false);
  }, []);

  const handleAdminLoginSuccess = (user) => {
    setAdminUser(user);
    setIsAdminLoggedIn(true);
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    // Remove token from API headers
    delete api.defaults.headers.common["Authorization"];

    setIsAdminLoggedIn(false);
    setAdminUser(null);
  };

  // Check if user can manage users (admin or super_admin)
  const canManageUsers = adminUser?.role === "admin" || adminUser?.role === "super_admin";

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            🏦 Bank ATM Management System
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              📝 Report Failure
            </Link>

            {isAdminLoggedIn ? (
              <>
                <Link to="/admin" className="nav-link">
                  👨‍💼 Admin Dashboard
                </Link>

                {/* Show User Management only if user can manage users */}
                {canManageUsers && (
                  <Link to="/users" className="nav-link">
                    👥 Manage Users
                  </Link>
                )}

                <div className="user-info">
                  <span className="username">
                    👤 {adminUser?.username} ({adminUser?.role})
                  </span>
                  <button className="logout-btn" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/admin-login" className="nav-link admin-login-link">
                🔐 Admin Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="app-container">
        <Routes>
          {/* User Form View */}
          <Route
            path="/"
            element={
              <div className="page-container">
                <div className="form-section">
                  <FailureForm />
                </div>
              </div>
            }
          />

          {/* Admin Login View */}
          <Route
            path="/admin-login"
            element={
              isAdminLoggedIn ? (
                <Navigate to="/admin" replace />
              ) : (
                <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
              )
            }
          />

          {/* Admin Dashboard View (Protected) */}
          <Route
            path="/admin"
            element={
              isAdminLoggedIn ? (
                <div className="page-container">
                  <div className="list-section">
                    <FailureList />
                  </div>
                </div>
              ) : (
                <Navigate to="/admin-login" replace />
              )
            }
          />

          {/* User Management View (Protected - Admin Only) */}
          <Route
            path="/users"
            element={
              isAdminLoggedIn && canManageUsers ? (
                <div className="page-container">
                  <div className="list-section">
                    <UserManagement />
                  </div>
                </div>
              ) : isAdminLoggedIn ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/admin-login" replace />
              )
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Bank Management System. All rights reserved.</p>
      </footer>
    </Router>
  );
}

export default App;
