/*const express = require("express");
const cors = require("cors"); // 1. Import cors
const PDFDocument = require("pdfkit");

const app = express();
const PORT = 5000;

// 2. Enable CORS so your React frontend (port 5173) can talk to your backend (port 5000)
app.use(cors());
app.use(express.json());

// Wrap your PDF code inside this route handler
app.get("/api/users/download-report", (req, res) => {
  try {
    // 1. Initialize PDF with custom margins
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="professional-report.pdf"');
    doc.pipe(res);

    // 2. Add a Styled Header Banner
    doc.rect(0, 0, 600, 100).fill("#1e293b"); // Dark slate blue banner
    doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold");
    doc.text("COMPANY ACTIVITY REPORT", 50, 35, { align: "left" });

    doc.moveDown(3); // Move past the banner

    // 3. Metadata Section (User Info & Date)
    doc.fillColor("#334155").fontSize(10).font("Helvetica");
    doc.text(`Generated For: User ID #${req.user ? req.user.id : "Guest"}`, 50, 120);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 135);

    // Divider Line
    doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, 155).lineTo(545, 155).stroke();

    // 4. Section Heading
    doc.moveDown(2);
    doc.fillColor("#0f172a").fontSize(16).font("Helvetica-Bold");
    doc.text("Security & Activity Summary");

    doc.moveDown(0.5);
    doc.fillColor("#475569").fontSize(11).font("Helvetica");
    doc.text("The following audit trail details recent account activities and security checkpoints verified by the backend system:");

    doc.moveDown(1);

    // 5. Styled Content Box / Table-like row
    doc.rect(50, doc.y, 495, 35).fill("#f8fafc"); // Light grey background box
    doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold");
    doc.text("Action Performed", 65, doc.y - 25);
    doc.text("Status", 450, doc.y);

    doc.moveDown(1.5);

    // Row Items
    doc.font("Helvetica").fillColor("#334155");
    doc.text("• Secure OAuth Login", 65);
    doc.text("Success", 450, doc.y - 12);

    doc.moveDown(0.5);
    doc.text("• Password Reset Code Verified", 65);
    doc.text("Verified", 450, doc.y - 12);

    doc.moveDown(0.5);
    doc.text("• Rate Limiting Threshold Check", 65);
    doc.text("Passed", 450, doc.y - 12);

    // 6. Footer (Pinned near bottom)
    doc.fontSize(9).fillColor("#94a3b8");
    doc.text("Confidential System Report — Generated Automatically by Node.js Backend", 50, 750, { align: "center", width: 495 });

    // Finalize PDF
    doc.end();

  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

*/

const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/users/download-report", (req, res) => {
  try {
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    // 'inline' tells the browser to display the PDF visually in a viewer/tab
    res.setHeader("Content-Disposition", 'inline; filename="professional-report.pdf"');
    doc.pipe(res);

    // Header Banner
    doc.rect(0, 0, 600, 100).fill("#1e293b");
    doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold");
    doc.text("COMPANY ACTIVITY REPORT", 50, 35, { align: "left" });

    doc.moveDown(3);

    // Metadata Section
    doc.fillColor("#334155").fontSize(10).font("Helvetica");
    doc.text(`Generated For: User ID #${req.user ? req.user.id : "Guest"}`, 50, 120);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 135);

    // Divider Line
    doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, 155).lineTo(545, 155).stroke();

    // Section Heading
    doc.moveDown(2);
    doc.fillColor("#0f172a").fontSize(16).font("Helvetica-Bold");
    doc.text("Security & Activity Summary");

    doc.moveDown(0.5);
    doc.fillColor("#475569").fontSize(11).font("Helvetica");
    doc.text("The following audit trail details recent account activities and security checkpoints verified by the backend system:");

    doc.moveDown(1);

    // Table Header Box
    doc.rect(50, doc.y, 495, 35).fill("#f8fafc");
    doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold");
    doc.text("Action Performed", 65, doc.y - 25);
    doc.text("Status", 450, doc.y);

    doc.moveDown(1.5);

    // Row Items
    doc.font("Helvetica").fillColor("#334155");
    doc.text("• Secure OAuth Login", 65);
    doc.text("Success", 450, doc.y - 12);

    doc.moveDown(0.5);
    doc.text("• Password Reset Code Verified", 65);
    doc.text("Verified", 450, doc.y - 12);

    doc.moveDown(0.5);
    doc.text("• Rate Limiting Threshold Check", 65);
    doc.text("Passed", 450, doc.y - 12);

    // Footer
    doc.fontSize(9).fillColor("#94a3b8");
    doc.text("Confidential System Report — Generated Automatically by Node.js Backend", 50, 750, { align: "center", width: 495 });

    doc.end();

  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});