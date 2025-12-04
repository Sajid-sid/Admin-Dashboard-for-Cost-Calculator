import React from "react";

export default function Topbar() {
  return (
    <div className="topbar">
      <div>
        <h2>Hello Admin,</h2>
        <p>Here you can manage your stores.</p>
      </div>
      <div className="admin-info">
        <img src="/admin-avatar.png" alt="Admin" className="admin-avatar" />
        <div>
          <h4>Admin</h4>
          <p>Admin@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
