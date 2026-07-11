import React from "react";

export default function StatCard({ icon, label, value, foot, color }) {
  return (
    <div className="stat-card" style={{ "--bar": color }}>
      <div className="stat-label">
        {icon}
        {label}
      </div>
      <div className="stat-value">{value}</div>
      {foot && <div className="stat-foot">{foot}</div>}
    </div>
  );
}
