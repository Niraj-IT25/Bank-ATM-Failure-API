import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./AdminLogin.css";

const AdminLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // // Registration state
  // const [isRegistering, setIsRegistering] = useState(false);
  // const [regData, setRegData] = useState({
  //   username: "",
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  //   role: "technician", // Default role
  // });

  // ============ LOGIN ============
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/admin/auth/login", {
        email: email.trim(),
        password,
      });

      // Save token to localStorage
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminUser", JSON.stringify(response.data.admin));

      // Update API header with token
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(response.data.admin);
      }

      // Redirect to dashboard
      navigate("/admin");

      setEmail("");
      setPassword("");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Login failed";
      setError(errorMsg);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        {
          <>
            {/* LOGIN VIEW */}
            <div className="login-header">
              <h1>🔐 Admin Login</h1>
              <p>Secure Access to ATM Dashboard</p>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">📧 Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="xxxx@bank.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">🔑 Password</label>
                <div className="password-field">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "👁️" : "🔒"}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

          </>
        }
      </div>
    </div>
  );
};

export default AdminLogin;
