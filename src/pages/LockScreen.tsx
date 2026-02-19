import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LockScreen() {
  const [message, setMessage] = useState("Waiting for verification...");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5000/api/super/verify", {
          method: "POST",
        });

        const data = await res.json();

        if (data.success) {
          clearInterval(interval);
          navigate("/admin");
        }

        if (!data.success && data.message) {
          setMessage(data.message);
        }

      } catch (err) {
        console.log("Verification error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={container}>
      <h1 style={{ fontSize: 40 }}>🔒 SYSTEM LOCKED</h1>
      <p>{message}</p>
      <p>💖 heyyy bby 💖</p>
    </div>
  );
}

const container = {
  background: "#070b14",
  height: "100vh",
  color: "#fff",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
  alignItems: "center",
  gap: 20,
};
