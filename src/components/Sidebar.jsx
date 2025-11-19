import React, { useState } from "react";
import "../dashboard.css";
import { FaBars } from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <h1 className="logo">{!collapsed && <span>My Dashboard</span>}</h1>
        <button
          className="menu-btn"
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle Menu"
        >
          <FaBars />
        </button>
      </div>

      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          🏠 {!collapsed && "Dashboard"}
        </NavLink>

        <NavLink
          to="/website"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          🌐 {!collapsed && "Website"}
        </NavLink>

        <NavLink
          to="/app"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          📱 {!collapsed && "App"}
        </NavLink>
      </nav>
    </div>
  );
}
