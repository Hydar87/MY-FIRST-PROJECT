export default function LoadingScreen() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f9fafb",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "4px solid #e5e7eb",
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <p style={{ marginTop: "16px", color: "#4b5563", fontSize: "14px" }}>
        Checking session...
      </p>
      
      {/* CSS Animation for the spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}