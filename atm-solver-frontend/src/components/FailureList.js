import React, { useEffect, useState } from "react";
import api from "../api";
import FailureItem from "./FailureItem";

const FailureList = () => {
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  // Fetch failures on component mount
  useEffect(() => {
    fetchFailures();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchFailures, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchFailures = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/failures");
      
      // Handle both response formats:
      // Old format: res.data = [failures]
      // New format: res.data = { failures: [...] }
      const failuresData = Array.isArray(res.data) 
        ? res.data 
        : res.data.failures || [];
      
      setFailures(failuresData);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setError(`Failed to load failures: ${errorMsg}`);
      console.error("Error fetching failures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await api.put(`/failures/${id}`, {
        status: "Resolved",
        resolutionNotes: "Fixed by technician",
      });
      
      // Handle both response formats
      const updatedFailure = res.data.failure || res.data;
      
      // Update the specific failure in the list
      setFailures(failures.map((f) => (f._id === id ? updatedFailure : f)));
      alert("✓ Failure marked as resolved!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      alert(`✗ Error: ${errorMsg}`);
      console.error("Error resolving failure:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this failure record?")) {
      try {
        await api.delete(`/failures/${id}`);
        setFailures(failures.filter((f) => f._id !== id));
        alert("✓ Failure record deleted!");
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        alert(`✗ Error: ${errorMsg}`);
        console.error("Error deleting failure:", error);
      }
    }
  };

  // Filter failures based on status
  const filteredFailures =
    filter === "All"
      ? failures
      : failures.filter((f) => f.status === filter);

  return (
    <div className="failure-list-container">
      <div className="list-header">
        <div>
          <h2>📋 Active ATM Failures</h2>
          <p className="total-count">
            Total: {failures.length} | Pending: {failures.filter(f => f.status === "Pending").length}
          </p>
        </div>
        <button onClick={fetchFailures} className="refresh-btn" disabled={loading}>
          {loading ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {["All", "Pending", "In Progress", "Resolved"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={filter === status ? "filter-btn active" : "filter-btn"}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Failures List */}
      {loading && failures.length === 0 ? (
        <p className="no-data">Loading failures...</p>
      ) : filteredFailures.length === 0 ? (
        <p className="no-data">
          {failures.length === 0
            ? "✓ No failures reported. All ATMs are working perfectly!"
            : `No ${filter} failures at the moment.`}
        </p>
      ) : (
        <div className="failures-grid">
          {filteredFailures.map((failure) => (
            <FailureItem
              key={failure._id}
              failure={failure}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FailureList;