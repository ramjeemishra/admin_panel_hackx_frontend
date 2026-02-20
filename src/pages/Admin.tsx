// admin panel code
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTeams, Team } from "../api/team.api";
import TeamCard from "../components/TeamCard";

function StreamTerminal({
  open,
  setOpen,
  url,
  title,
  color,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  url: string;
  title: string;
  color: string;
}) {
  const [logs, setLogs] = useState<string[]>([]);
  const eventRef = useRef<EventSource | null>(null);

  const getLogStyle = (log: string) => {
    if (log.includes("✓")) return { color: "#22c55e" };
    if (log.includes("✗")) return { color: "#ef4444" };
    return { color: "#94a3b8" };
  };

  useEffect(() => {
    if (!open) return;

    setLogs([]);
    if (eventRef.current) eventRef.current.close();

    const es = new EventSource(url);
    eventRef.current = es;

    es.onmessage = (e) => {
      setLogs((prev) => [...prev, e.data]);
    };

    es.onerror = () => {
      es.close();
      eventRef.current = null;
    };

    return () => es.close();
  }, [open, url]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: 40 }}>
      <div style={{ width: "100%", maxWidth: 1100, height: "85vh", background: "#0b0f19", border: `1px solid ${color}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 24px", background: color, color: "#000", display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
          <span>{title}</span>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "1px solid #000", padding: "4px 10px", cursor: "pointer", fontWeight: 800 }}>
            CLOSE
          </button>
        </div>
        <div style={{ flex: 1, padding: 24, overflowY: "auto", fontFamily: "monospace", fontSize: 13 }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: 6, ...getLogStyle(log) }}>
              {`[LOG_${i}] > ${log}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showMail, setShowMail] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [search, setSearch] = useState("");

// useEffect(() => {
//   console.log("Admin polling started");

//   const checkStatus = async () => {
//     try {
//       const res = await fetch(
//         "https://admin-panel-hackx-backend.onrender.com/api/super/status"
//       );
//       const data = await res.json();

//       if (data.forceLogout === true) {
//         navigate("/");
//       }
//     } catch (err) {
//       console.error("unknown error:", err);
//     }
//   };

//   const interval = setInterval(checkStatus, 3000);

//   return () => clearInterval(interval);
// }, []);

  useEffect(() => {
    fetchTeams()
      .then((data) => {
        setTeams(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showMail && !showQR) {
      fetchTeams().then(setTeams);
    }
  }, [showMail, showQR]);

  const totalTeams = useMemo(() => teams.length, [teams]);
  const sentCount = useMemo(() => teams.filter(t => t.mailStatus === "SENT").length, [teams]);
  const failedCount = useMemo(() => teams.filter(t => t.mailStatus === "FAILED").length, [teams]);
  const pendingCount = useMemo(() => teams.filter(t => t.mailStatus !== "SENT").length, [teams]);

  const filteredTeams = useMemo(() => {
    if (!search.trim()) return teams;

    const query = search.toLowerCase();

    return teams.filter((team: any) => {
      const teamMatch =
        team.teamName?.toLowerCase().includes(query) ||
        team.teamCode?.toLowerCase().includes(query);

      const leaderMatch =
        team.lead?.name?.toLowerCase().includes(query) ||
        team.lead?.email?.toLowerCase().includes(query) ||
        team.lead?.phone?.includes(query);

      const memberMatch = team.members?.some((m: any) =>
        m.fullName?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.phone?.includes(query)
      );

      return teamMatch || leaderMatch || memberMatch;
    });
  }, [teams, search]);

  return (
    <div style={{ backgroundColor: "#070b14", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <StreamTerminal
        open={showQR}
        setOpen={setShowQR}
        url="https://admin-panel-hackx-backend.onrender.com/api/admin/generate-all-qrs/stream"
        // url="http://localhost:5000/api/admin/generate-all-qrs/stream"
        title="QR DISPATCH TERMINAL"
        color="#e10600"
      />

      <StreamTerminal
        open={showMail}
        setOpen={(v) => {
          setShowMail(v);
          setRetryMode(false);
        }}
        url={
          retryMode
            ? "https://admin-panel-hackx-backend.onrender.com/api/admin/retry-failed-mails/stream"
            : "https://admin-panel-hackx-backend.onrender.com/api/admin/send-all-leader-mails/stream"
        }
        title={retryMode ? "RETRY FAILED MAILS TERMINAL" : "MAIL DISPATCH TERMINAL"}
        color="#22c55e"
      />

      <nav style={{ padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b" }}>
        <h2 style={{ fontWeight: 900, fontSize: 22, margin: 0 }}>
          HACK<span style={{ color: "#e10600" }}>X</span> ADMIN
        </h2>

        <div style={{ display: "flex", gap: 18 }}>
          <button onClick={() => setShowQR(true)}>Generate All QRs</button>
          <button onClick={() => { setRetryMode(false); setShowMail(true); }} disabled={pendingCount === 0}>
            Send Mail At Once
          </button>
          <button onClick={() => { setRetryMode(true); setShowMail(true); }} disabled={failedCount === 0}>
            Retry Failed
          </button>
          <button onClick={() => navigate("/filters")}>Filters</button>
          <button onClick={() => navigate("/upload-csv")}>Upload CSV</button>
        </div>
      </nav>

      <main style={{ padding: "60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
          <div>Total Teams: {totalTeams}</div>
          <div>Sent: {sentCount}</div>
          <div>Failed: {failedCount}</div>
          <div>Pending: {pendingCount}</div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <input
            type="text"
            placeholder="Search by team name, member name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 18px",
              background: "#0f172a",
              border: "1px solid #1e293b",
              color: "#fff",
              fontSize: 14,
            }}
          />
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 32 }}>
            {filteredTeams.map((team, index) => (
              <TeamCard key={team._id} team={team} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
