// pages/Dashboard.jsx
import React from "react";
import DashboardCard from "../components/DashboardCard";

export default function Dashboard() {
  return (
    <>
      <h2 className="overview-title">Dashboard Overview</h2>
      <div className="cards-container">
        <DashboardCard title="Total Stores" value="0" icon="🏬" color="card-red" />
        <DashboardCard title="Active Stores" value="0" icon="✅" />
        <DashboardCard title="In Active Stores" value="0" icon="❌" />
        <DashboardCard title="Newly Joined Stores" value="0" icon="➕" />
      </div>
    </>
  );
}
