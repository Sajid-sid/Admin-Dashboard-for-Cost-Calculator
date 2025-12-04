import React, { useEffect, useState } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function WebsitePage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/quotations");
        setQuotations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching website quotations:", err);
        setError("Failed to fetch website quotations");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  const formatTableDetails = (details) => {
    if (!details) return "N/A";

    try {
      const parsed = typeof details === "string" ? JSON.parse(details) : details;

      return parsed
        .map((section) => {
          if (!section.items || section.items.length === 0)
            return `${section.title}:`;

          const itemsText = section.items
            .map((item) => {
              if (typeof item === "string") return item;
              if (typeof item === "object")
                return item.name || item.title || item.label || "";
              return String(item);
            })
            .filter(Boolean)
            .join(", ");

          return `${section.title}: ${itemsText}`;
        })
        .join("\n");
    } catch (err) {
      return String(details).replace(/,/g, "\n");
    }
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Website Quotations");

    sheet.columns = [
      { header: "Name", key: "customer_name", width: 20 },
      { header: "Email", key: "customer_email", width: 25 },
      { header: "Phone", key: "customer_phone", width: 15 },
      { header: "Message", key: "message", width: 30 },
      { header: "Grand Total (₹)", key: "grand_total", width: 20 },
      { header: "Table Details", key: "table_details", width: 60 },
      { header: "Created At", key: "created_at", width: 22 },
    ];

    const header = sheet.getRow(1);
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4F81BD" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });

    quotations.forEach((q) => {
      const row = sheet.addRow({
        customer_name: q.customer_name,
        customer_email: q.customer_email,
        customer_phone: q.customer_phone,
        message: q.message,
        grand_total: q.grand_total,
        table_details: formatTableDetails(q.table_details),
        created_at: q.created_at ? new Date(q.created_at).toLocaleString() : "N/A",
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
    saveAs(new Blob([buffer]), "website_quotations.xlsx");
  };

  if (loading) return <p>Loading website quotations...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (quotations.length === 0) return <p>No website quotations found.</p>;

  return (
    <div className="website-page">
      <h2>Website Quotations Dashboard</h2>

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
              <th>Grand Total</th>
              <th>Table Details</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id}>
                <td>{q.customer_name}</td>
                <td>{q.customer_email}</td>
                <td>{q.customer_phone}</td>
                <td>{q.message}</td>
                <td>₹{q.grand_total || "0.00"}</td>
                <td><pre>{formatTableDetails(q.table_details)}</pre></td>
                <td>{q.created_at ? new Date(q.created_at).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
