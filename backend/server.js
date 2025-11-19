// Import packages
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// -------------------------------
// Required to fix __dirname issue
// -------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to DB
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to database.");
  }
});

// Fetch admin users
app.get("/users", (req, res) => {
  const query = "SELECT * FROM quotationadmin";
  db.query(query, (err, results) => {
    if (err) res.status(500).send(err);
    else res.json(results);
  });
});

// ---- FILE UPLOAD (PDF Only) ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files allowed!"), false);
};

const upload = multer({ storage, fileFilter });

// Test route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// Send Email + Save DB
app.post("/send-email", upload.single("pdf"), async (req, res) => {
  const { name, email, phone, message, tableDetails, grandTotal } = req.body;
  const pdfFile = req.file;

  if (!name || !email || !phone || !pdfFile) {
    return res.status(400).json({
      message: "Missing name, email, phone, or PDF file.",
    });
  }

  try {
    let tableDetailsText = "";

    try {
      const parsed = JSON.parse(tableDetails);
      tableDetailsText = parsed
        .map(
          (section) =>
            `${section.title}: ${section.items
              .map((item) =>
                typeof item === "object"
                  ? item.name || item.title || item.label || ""
                  : item
              )
              .join(", ")}`
        )
        .join("\n");
    } catch {
      tableDetailsText = tableDetails || "";
    }

    const total = parseFloat(grandTotal) || 0;

    // Save to DB
    const insertQuery = `
      INSERT INTO quotations 
      (name, email, phone, message, table_details, grand_total)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [name, email, phone, message || "", tableDetailsText, total];

    db.query(insertQuery, values, (err) => {
      if (err) console.error("❌ DB insert error:", err);
      else console.log("✅ Quotation saved successfully");
    });

    // Email sender
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Admin email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "info@aspireths.com",
      subject: "New Quotation Request",
      html: `
        <h3>Client Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message || "N/A"}</p>
        <p><strong>Grand Total:</strong> ₹${total.toFixed(2)}</p>
        <pre>${tableDetailsText}</pre>
      `,
      attachments: [{ filename: "Requirements_Summary.pdf", path: pdfFile.path }],
    });

    // Client email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your Project Summary - ${name}`,
      text: `
Hello ${name},

Thank you for using Aspire TekHub's Website Cost Calculator.
Your project summary PDF is attached.
      `,
      attachments: [
        { filename: "Your_Quotation_Summary.pdf", path: pdfFile.path },
      ],
    });

    fs.unlinkSync(pdfFile.path);

    res.status(200).json({
      message: "✅ Email sent & quotation saved!",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      message: "Failed to send email",
      error: error.message,
    });
  }
});

// Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const sql =
    "SELECT * FROM quotationadmin WHERE username = ? AND password = ?";

  db.query(sql, [username, password], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
    });
  });
});

// Fetch all quotations
app.get("/api/quotations", (req, res) => {
  const query = "SELECT * FROM quotations ORDER BY id DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ DB fetch error:", err);
      return res.status(500).json({ message: "Failed to fetch quotations" });
    }
    res.json(results);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
