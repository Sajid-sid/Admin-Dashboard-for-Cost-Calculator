import React from "react";
import DashboardCard from "./DashboardCard";
import { FaUsers, FaChartLine, FaDollarSign } from "react-icons/fa";

function DashboardOverview() {
  const cardsData = [
    { title: "Total Users", value: 150, icon: <FaUsers />, color: "blue" },
    { title: "Active Sessions", value: 87, icon: <FaChartLine />, color: "green" },
    { title: "Revenue", value: "$12,500", icon: <FaDollarSign />, color: "orange" },
  ];

  return (
    <div>
      <h1>Dashboard Overview</h1>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
        {cardsData.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>
    </div>
  );
}

export default DashboardOverview;
