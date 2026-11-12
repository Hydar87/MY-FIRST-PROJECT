/*import React, { useState } from "react";

export default function DownloadButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      // 1. Send GET request to your backend PDF endpoint
      const response = await fetch("http://localhost:5000/api/users/download-report", {
        method: "GET",
        // If your route is protected by a token later, add it here:
        // headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // 2. Convert the backend response stream into a binary Blob
      const blob = await response.blob();

      // 3. Create a temporary local object URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob);

      // 4. Programmatically create an anchor tag to trigger the browser download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "professional-report.pdf"; // Name of the downloaded file
      document.body.appendChild(link);
      link.click();

      // 5. Clean up the temporary link and URL memory
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download report from backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      disabled={loading}
      style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
    >
      {loading ? "Generating PDF on Backend..." : "Download PDF Report"}
    </button>
  );
}

*/
import React from "react";

export default function DownloadButton() {
  const handleViewReport = () => {
    // Directly opens your backend PDF route in a new tab.
    // The browser will natively render and display the PDF document.
    window.open("http://localhost:5000/api/users/download-report", "_blank");
  };

  return (
    <button 
      onClick={handleViewReport}
      style={{ 
        padding: "10px 20px", 
        fontSize: "16px", 
        cursor: "pointer", 
        background: "#2563eb", 
        color: "#fff", 
        border: "none", 
        borderRadius: "4px" 
      }}
    >
      View PDF Report
    </button>
  );
}