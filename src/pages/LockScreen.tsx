import { Bluetooth } from "lucide-react";
import React from "react";

export default function LockScreen() {
  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>SYSTEM LOCKED 🔒</h1>
        <p style={message}>
         💖💖 Fuck offf 💖💖
        </p>
        <div style={statusRow}>
          <div style={dot} />
          <span style={statusText}>Monitoring unlock status...</span>
        </div>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  background: "#070b14",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const card: React.CSSProperties = {
  textAlign: "center",
  padding: "60px 80px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  backdropFilter: "blur(8px)",
  maxWidth: 500,
};

const icon: React.CSSProperties = {
  fontSize: 48,
};

const title: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  letterSpacing: 1,
  marginBottom: "7dvh",
  color: "#3CB371",
};

const message: React.CSSProperties = {
  fontSize: 15,
  opacity: 0.75,
  lineHeight: 1.6,
  marginBottom: 30,
};

const statusRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  fontSize: 13,
  opacity: 0.8,
};

const dot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#22c55e",
  boxShadow: "0 0 8px #22c55e",
};

const statusText: React.CSSProperties = {
  letterSpacing: 0.5,
};