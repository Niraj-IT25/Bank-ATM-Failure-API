import React from "react";

const FailureItem = ({ failure, onResolve, onDelete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="badge badge-pending">⏳ Pending</span>;
      case "In Progress":
        return <span className="badge badge-progress">🔧 In Progress</span>;
      case "Resolved":
        return <span className="badge badge-resolved">✓ Resolved</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className={`failure-card status-${failure.status.toLowerCase()}`}>
      <div className="card-header">
        <h3 className="atm-id">🏧 {failure.atmId}</h3>
        {getStatusBadge(failure.status)}
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="label">👤 Customer:</span>
          <span className="value">{failure.customerName}</span>
        </div>

        <div className="info-row">
          <span className="label">📱 Phone:</span>
          <span className="value">{failure.customerPhone}</span>
        </div>

        <div className="info-row">
          <span className="label">⚠️ Issue:</span>
          <span className="value">{failure.issueType}</span>
        </div>

        <div className="info-row">
          <span className="label">📅 Reported:</span>
          <span className="value">{formatDate(failure.timestamp)}</span>
        </div>

        {failure.resolutionNotes && (
          <div className="info-row">
            <span className="label">📝 Notes:</span>
            <span className="value">{failure.resolutionNotes}</span>
          </div>
        )}
      </div>

      <div className="card-actions">
        {failure.status !== "Resolved" && (
          <button
            className="btn btn-resolve"
            onClick={() => onResolve(failure._id)}
            title="Mark this failure as resolved"
          >
            ✓ Mark Resolved
          </button>
        )}

        <button
          className="btn btn-delete"
          onClick={() => onDelete(failure._id)}
          title="Delete this record"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default FailureItem;
