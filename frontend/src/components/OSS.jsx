// src/components/OOSAnalysis.jsx

import React from "react";

const OOSAnalysis = ({ oosEvents, currentlyOosCount }) => {
  return (
    <div className="oos-analysis-container">
      <h2>Out-of-Shelf Analysis</h2>
      <div className="oos-summary">
        <div className="summary-card">
          <span className="summary-value">{currentlyOosCount}</span>
          <span className="summary-label">Items Currently OOS</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{oosEvents.length}</span>
          <span className="summary-label">Total OOS Events Today</span>
        </div>
      </div>
      <div className="oos-log">
        <h3>Recent OOS Event Log</h3>
        {oosEvents.length > 0 ? (
          <ul>
            {oosEvents.map((event) => (
              <li key={event.id}>
                <strong>{event.productName}</strong> went out of stock at{" "}
                <em>{event.timestamp.toLocaleTimeString()}</em>
              </li>
            ))}
          </ul>
        ) : (
          <p>No out-of-stock events recorded yet. All shelves are stocked!</p>
        )}
      </div>
    </div>
  );
};

export default OOSAnalysis;
