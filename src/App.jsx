import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import WebsitePage from "./pages/website";
import AppPage from "./pages/AppPage";

export default function App() {
  return (
    <Routes>
      {/* Login page - no Layout */}
      <Route path="/" element={<Login />} />

      {/* Protected pages - use Layout */}
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="/website" element={<WebsitePage />} />
        <Route path="app" element={<AppPage />} />
      </Route>
    </Routes>
  );
}
