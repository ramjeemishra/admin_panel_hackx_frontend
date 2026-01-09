import { useState } from "react";
import { Team } from "../api/team.api";

export default function TeamCard({ team }: { team: Team }) {
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const people = [
    {
      name: team.lead.name,
      email: team.lead.email,
      role: "Leader",
    },
    ...team.members.map((m) => ({
      name: m.fullName,
      email: m.email,
      role: "Member",
    })),
  ];

  const generateQR = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://admin-panel-hackx-backend.onrender.com/api/teams/${team._id}/qrs`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setQr(data[0].qr);
      } else if (data.qr) {
        setQr(data.qr);
      } else {
        throw new Error("Invalid QR response");
      }
    } catch (err) {
      console.error("QR FETCH ERROR", err);
      setQr(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 18px" }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>{team.teamName}</h3>
        <p style={{ margin: "4px 0", fontSize: 13, color: "#6b7280" }}>
          Leader • <strong>{team.lead.name}</strong>
        </p>
      </div>

      <div
        style={{
          padding: "8px 18px",
          borderTop: "1px solid #e5e7eb",
          borderBottom: "1px solid #e5e7eb",
          maxHeight: 160,
          overflowY: "auto",
        }}
      >
        {people.map((p, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "20px 1fr",
              gap: 8,
              padding: "6px 0",
              fontSize: 13,
              alignItems: "center",
            }}
          >
            <span style={{ color: "#9ca3af" }}>{i + 1}</span>
            <div>
              <strong>{p.name}</strong>{" "}
              <span style={{ color: "#9ca3af" }}>({p.role})</span>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {p.email}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        <button
          onClick={generateQR}
          disabled={loading}
          style={{
            width: "100%",
            background: "#111827",
            color: "#ffffff",
            border: "none",
            padding: "10px 0",
            borderRadius: 10,
            fontSize: 14,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Generating..." : "Generate Team QR"}
        </button>
      </div>

      {qr && (
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: 20,
            textAlign: "center",
          }}
        >
          <img
            src={qr}
            alt="Team QR"
            style={{
              width: 180,
              borderRadius: 12,
            }}
          />
          <p
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            Scan to view full team details
          </p>
        </div>
      )}
    </div>
  );
}
