import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTeams, Team } from "../api/team.api";
import TeamCard from "../components/TeamCard";

function GlobalQRTelemetry({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const eventRef = useRef<EventSource | null>(null);

  const getLogStyle = (log: string) => {
    if (log.includes("✓") || log.includes("Done") || log.includes("successfully")) return { color: "#22c55e" };
    if (log.includes("✗") || log.includes("Failed")) return { color: "#ef4444" };
    return { color: "#d1d5db" };
  };

  const startStream = () => {
    setLogs([]);
    if (eventRef.current) eventRef.current.close();
    
    const es = new EventSource("http://localhost:5000/api/admin/generate-all-qrs/stream");
    eventRef.current = es;

    es.onmessage = (e) => setLogs((prev) => [...prev, e.data]);
    es.onerror = () => {
      es.close();
      eventRef.current = null;
    };
  };

  useEffect(() => {
    if (open) startStream();
    return () => eventRef.current?.close();
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.95)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 900,
        height: "80vh",
        background: "#05080f",
        border: "1px solid #e10600",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 50px rgba(225, 6, 0, 0.2)"
      }}>
        <div style={{ padding: "16px 24px", background: "#e10600", color: "#fff", display: "flex", justifyContent: "space-between", fontWeight: 900, fontStyle: "italic" }}>
          <span>SYSTEM TELEMETRY: BULK QR GENERATION</span>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "1px solid #fff", color: "#fff", cursor: "pointer", padding: "2px 8px", fontWeight: 900 }}>CLOSE</button>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: "auto", fontFamily: "monospace", fontSize: 13 }}>
          {logs.length === 0 && <div style={{ color: "#475569" }}>Initializing race data stream...</div>}
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: 4, ...getLogStyle(log) }}>{`[PIT_LOG_${i}] > ${log}`}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams()
      .then((data) => {
        setTeams(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ 
      backgroundColor: "#0b0f19", 
      minHeight: "100vh", 
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
      backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
      backgroundSize: "24px 24px" 
    }}>
      <GlobalQRTelemetry open={showTelemetry} setOpen={setShowTelemetry} />

      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 40px",
        background: "rgba(11, 15, 25, 0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #1e293b",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 4, height: 24, background: "#e10600", transform: "skewX(-15deg)" }} />
          <h2 style={{ fontSize: 20, fontWeight: 900, fontStyle: "italic", margin: 0 }}>
            HACK<span style={{ color: "#e10600" }}>X</span>ADMIN
          </h2>
        </div>
        
        <div style={{ display: "flex", gap: "32px", fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
          <span style={{ color: "#fff" }}>Dashboard</span>
          <span>Drivers</span>
          <span>Constructors</span>
          <span>Circuits</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e10600", fontSize: 11, fontWeight: 800 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e10600" }} />
            LIVE TELEMETRY
          </div>
        </div>
      </nav>

      <main style={{ padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div>
            <div style={{ background: "#e10600", color: "#fff", display: "inline-block", padding: "2px 8px", fontSize: 10, fontWeight: 900, marginBottom: 8 }}>ADMIN</div>
            <h1 style={{ fontSize: 48, fontWeight: 900, fontStyle: "italic", margin: "0", textTransform: "uppercase" }}>
              THE RACING <span style={{ color: "#e10600" }}>GRID</span>
            </h1>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px" }}>
             <button 
               onClick={() => setShowTelemetry(true)}
               style={{
                 background: "transparent",
                 border: "1px solid #334155",
                 color: "#fff",
                 padding: "10px 20px",
                 fontSize: 12,
                 fontWeight: 700,
                 fontStyle: "italic",
                 cursor: "pointer",
                 textTransform: "uppercase"
               }}>
               ● Generate All QRs
             </button>
             <button
              onClick={() => navigate("/upload-csv")}
              style={{
                padding: "14px 28px",
                background: "#e10600",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 900,
                fontStyle: "italic",
                cursor: "pointer",
                clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)",
              }}
            >
              ↑ UPLOAD CSV
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "48px", borderTop: "1px solid #1e293b", paddingTop: "32px" }}>
          {[
            { label: "Total Teams", value: teams.length, icon: "🏁" },
            { label: "Status", value: "Ready", icon: "🟢" },
            { label: "Circuit", value: "HackX Pro", icon: "🏎️" },
            { label: "Pace", value: "Optimal", icon: "⏱️" }
          ].map((stat, i) => (
            <div key={i} style={{ background: "#111827", border: "1px solid #1e293b", padding: "20px" }}>
               <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
                 {stat.label} <span>{stat.icon}</span>
               </div>
               <div style={{ fontSize: 28, fontWeight: 900, fontStyle: "italic", marginTop: 8 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px", color: "#e10600", fontWeight: 900, fontStyle: "italic" }}>INITIALIZING PIT WALL...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "32px" }}>
            {teams.map((team, index) => (
              <TeamCard key={team._id} team={team} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}