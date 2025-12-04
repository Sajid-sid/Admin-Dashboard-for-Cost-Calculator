
import React, { useEffect, useState } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function AppPage() {
  const [appRequests, setAppRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/app-quotations");
        setAppRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching app cost requests:", err);
        setError("Failed to fetch app cost requests");
      } finally {
        setLoading(false);
      }
    };

    fetchAppRequests();
  }, []);

  const formatDetails = (details) => {
    if (!details) return "N/A";

    try {
      const parsed = JSON.parse(details);

      if (!Array.isArray(parsed)) return details;

      return parsed
        .map((section) => {
          const title = section.title || section.name || "Section";
          const items = section.items?.length
            ? section.items.map((it) => (typeof it === "string" ? it : it.name)).join(", ")
            : "-";
          return `${title}: ${items}`;
        })
        .join("\n");
    } catch {
      return details;
    }
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("App Cost Requests");

    sheet.columns = [
      { header: "Name", key: "customer_name", width: 20 },
      { header: "Email", key: "customer_email", width: 25 },
      { header: "Phone", key: "customer_phone", width: 15 },
      { header: "Table Details", key: "table_details", width: 60 },
      { header: "Grand Total", key: "grand_total", width: 15 },
      { header: "Created At", key: "created_at", width: 25 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4F81BD" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });

    appRequests.forEach((req) => {
      const row = sheet.addRow({
        customer_name: req.customer_name,
        customer_email: req.customer_email,
        customer_phone: req.customer_phone,
        table_details: formatDetails(req.table_details),
        grand_total: req.grand_total ? `₹${req.grand_total}` : "N/A",
        created_at: req.created_at ? new Date(req.created_at).toLocaleString() : "N/A",
      });

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };
        cell.alignment = { wrapText: true, vertical: "top" };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "app_cost_requests.xlsx");
  };

  if (loading) return <p>Loading app cost requests...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!appRequests.length) return <p>No app cost requests found.</p>;

  return (
    <div className="app-page">
      <h2>App Cost Requests Dashboard</h2>

      <button className="download-btn" onClick={downloadExcel}>
        Download Excel 📥
      </button>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Table Details</th>
              <th>Grand Total</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {appRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.customer_name}</td>
                <td>{req.customer_email}</td>
                <td>{req.customer_phone}</td>
                <td>{req.message || "N/A"}</td>
                <td>
                  <pre>{formatDetails(req.table_details)}</pre>
                </td>
                <td>₹{req.grand_total}</td>
                <td>{req.created_at ? new Date(req.created_at).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
            
          </tbody>
        </table>
      </div>
    </div>
  );
}
