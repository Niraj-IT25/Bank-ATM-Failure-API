import React, { useState } from "react";
import api from "../api";

const FailureForm = () => {
  const [atmId, setAtmId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [issueType, setIssueType] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const issueTypes = [
    "Cash not dispensed",
    "Card stuck",
    "Screen not working",
    "Keypad not responding",
    "Network issue",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Validation
    if (!atmId.trim() || !customerName.trim() || !customerPhone.trim() || !issueType) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (customerPhone.length !== 10 || !/^\d+$/.test(customerPhone)) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/failures", {
        atmId: atmId.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        issueType,
      });

      setMessage("✓ Thank you! Failure reported successfully. Our team will fix it soon.");
      console.log("Failure created:", response.data);

      // Reset form
      setAtmId("");
      setCustomerName("");
      setCustomerPhone("");
      setIssueType("");

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Error reporting failure";
      setError(`✗ ${errorMsg}`);
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="failure-form">
        <h2>🔴 Report ATM Failure</h2>
        <p className="form-subtitle">Help us fix the issue faster</p>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          placeholder="ATM ID (e.g., ATM-001)"
          value={atmId}
          onChange={(e) => setAtmId(e.target.value)}
          disabled={loading}
          required
        />

        <input
          type="text"
          placeholder="Your Full Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={loading}
          required
        />

        <input
          type="tel"
          placeholder="Your Phone (10 digits)"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
          maxLength="10"
          disabled={loading}
          required
        />

        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          disabled={loading}
          required
        >
          <option value="">Select Issue Type</option>
          {issueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Reporting..." : "Report Issue"}
        </button>
      </form>
    </div>
  );
};

export default FailureForm;
