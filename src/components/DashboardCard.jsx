import React from "react";

export default function DashboardCard({ title, value, icon, color = "" }) {
  return (
    <div className={`card ${color}`}>
      <div className="card-header">
        <h3>{title}</h3>
        <span className="card-icon">{icon}</span>
      </div>
      <p className="card-value">{value}</p>
      <p className="card-footer">0% from last month</p>
    </div>
  );
}
