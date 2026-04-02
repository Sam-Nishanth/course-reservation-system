import React from "react";

export default function LoadingScreen() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "var(--bg)",
      flexDirection: "column",
      gap: "1rem",
    }}>
      <div style={{
        width: 44,
        height: 44,
        border: "3px solid var(--border)",
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 500 }}>
        Loading CourseHub...
      </p>
    </div>
  );
}