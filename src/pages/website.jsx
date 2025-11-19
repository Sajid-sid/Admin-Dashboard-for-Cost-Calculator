import React, { useEffect, useState } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
export default function WebsitePage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/quotations");
        if (Array.isArray(res.data)) setQuotations(res.data);
      } catch (err) {
        console.error("Error fetching quotations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  // =============================
  // 🟦 FORMAT TABLE DETAILS FOR UI + EXCEL
  // =============================
  const formatTableDetails = (details) => {
    if (!details) return "N/A"; // handle null or undefined

    try {
      const parsed = JSON.parse(details);
      return parsed
        .map(
          (row) =>
            `Item: ${row.item}
Quantity: ${row.qty}
Price: ${row.price}
Total: ${row.total}`
        )
        .join("\n-----------------------------\n\n");
    } catch (err) {
      return String(details).replace(/,/g, "\n"); // ensure it's always a string
    }
  };


  // =============================
  // 🟩 DOWNLOAD EXCEL FUNCTION
  // =============================
  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Quotations");

    // Set Columns
    sheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Message", key: "message", width: 30 },
      { header: "Grand Total (₹)", key: "grand_total", width: 20 },
      { header: "Table Details", key: "table_details", width: 60 },
      { header: "Created At", key: "created_at", width: 22 },
    ];

    // Header Row Styling
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });

    // Add Rows
    quotations.forEach((q) => {
      const row = sheet.addRow({
        name: q.name,

        email: q.email,
        phone: q.phone,
        message: q.message,
        grand_total: q.grand_total,
        table_details: formatTableDetails(q.table_details),
        created_at: q.created_at
          ? new Date(q.created_at).toLocaleString()
          : "N/A",
      });

      // Border + Wrap Style for each cell
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
    saveAs(new Blob([buffer]), "quotations.xlsx");
  };

  if (loading) return <p>Loading...</p>;
  if (quotations.length === 0) return <p>No quotations found.</p>;

  return (
    <>
      <div className="website-page">
        <h2>Website Page / Dashboard</h2>

        <button className="download-btn" onClick={downloadExcel}>
          Download Excel 📥
        </button>

        <div className="table-responsive
    ">
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
                  <td>{q.name}</td>
                  <td>{q.email}</td>
                  <td>{q.phone}</td>
                  <td>{q.message}</td>
                  <td>₹{q.grand_total ? q.grand_total : "0.00"}</td>

                  <td>
                    <pre className="table-details">
                      {formatTableDetails(q.table_details)}
                    </pre>
                  </td>

                  <td>
                    {q.created_at
                      ? new Date(q.created_at).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
