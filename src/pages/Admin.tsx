import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTeams, Team } from "../api/team.api";
import TeamCard from "../components/TeamCard";

const THEME = {
  bg: "#020617",
  surface: "#0f172a",
  border: "#1e293b",
  accent: "#e10600",
  success: "#22c55e",
  text: "#f8fafc",
  muted: "#94a3b8"
};

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setLogs([]);
    const es = new EventSource(url);
    eventRef.current = es;
    es.onmessage = (e) => setLogs((prev) => [...prev, e.data]);
    es.onerror = () => {
      es.close();
      eventRef.current = null;
    };
    return () => es.close();
  }, [open, url]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2, 6, 23, 0.95)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(8px)", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "1000px", height: "80vh", background: "#000", border: `1px solid ${THEME.border}`, borderRadius: "8px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: `0 0 40px -10px ${color}44` }}>
        <div style={{ padding: "12px 16px", background: "#111", borderBottom: `1px solid ${THEME.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: "#fff", wordBreak: "break-all" }}>{title}</span>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: THEME.muted, cursor: "pointer", fontSize: "20px", flexShrink: 0, marginLeft: "8px" }}>×</button>
        </div>
        <div ref={scrollRef} style={{ flex: 1, padding: "16px", overflowY: "auto", fontFamily: "'Fira Code', monospace", fontSize: "12px", lineHeight: "1.6", background: "linear-gradient(rgba(18, 18, 18, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))", backgroundSize: "100% 4px, 3px 100%" }}>
          {logs.map((log, i) => (
            <div key={i} style={{ color: log.includes("✓") ? THEME.success : log.includes("✗") ? THEME.accent : "#888" }}>
              <span style={{ opacity: 0.4, marginRight: "8px" }}>[{i.toString().padStart(3, "0")}]</span>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Responsive hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export default function Home() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showMail, setShowMail] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isProduction = import.meta.env.PROD;

  useEffect(() => {
    fetchTeams().then((data) => {
      setTeams(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showMail && !showQR) fetchTeams().then(setTeams);
  }, [showMail, showQR]);

  const stats = useMemo(() => ({
    total: teams.length,
    sent: teams.filter(t => t.mailStatus === "SENT").length,
    failed: teams.filter(t => t.mailStatus === "FAILED").length,
    pending: teams.filter(t => t.mailStatus !== "SENT").length
  }), [teams]);

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return teams;
    return teams.filter(t =>
      t.teamName?.toLowerCase().includes(q) ||
      t.lead?.name?.toLowerCase().includes(q) ||
      t.lead?.email?.toLowerCase().includes(q)
    );
  }, [teams, search]);

  const btnStyle = (bg = THEME.surface, color = "#fff", isDisabled = false) => ({
    padding: "8px 14px",
    background: isDisabled ? "#1e293b" : bg,
    color: isDisabled ? "#475569" : color,
    border: `1px solid ${isDisabled ? "#1e293b" : THEME.border}`,
    borderRadius: "4px",
    cursor: isDisabled ? "not-allowed" : "pointer",
    fontSize: "13px",
    fontWeight: 600,
    transition: "all 0.2s",
    opacity: isDisabled ? 0.5 : 1,
    whiteSpace: "nowrap" as const,
    width: isMobile ? "100%" : "auto",
    textAlign: "left" as const,
  });

  const navActions = (
    <>
      <button style={btnStyle()} onClick={() => { setShowQR(true); setMobileMenuOpen(false); }}>Generate QRs</button>
      <button
        style={btnStyle(THEME.success, "#000", stats.pending === 0 || isProduction)}
        onClick={() => { setRetryMode(false); setShowMail(true); setMobileMenuOpen(false); }}
        disabled={stats.pending === 0 || isProduction}
      >
        Dispatch Mails
      </button>
      <button
        style={btnStyle(THEME.accent, "#fff", stats.failed === 0 || isProduction)}
        onClick={() => { setRetryMode(true); setShowMail(true); setMobileMenuOpen(false); }}
        disabled={stats.failed === 0 || isProduction}
      >
        Retry Failed
      </button>
      {!isMobile && <div style={{ width: "1px", background: THEME.border, margin: "0 4px" }} />}
      <button style={btnStyle()} onClick={() => { navigate("/filters"); setMobileMenuOpen(false); }}>Filters</button>
      <button style={btnStyle()} onClick={() => { navigate("/upload-csv"); setMobileMenuOpen(false); }}>Import CSV</button>
    </>
  );

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: "100vh", color: THEME.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <StreamTerminal open={showQR} setOpen={setShowQR} title="SYSTEM::QR_GENERATOR" color={THEME.accent} url="https://admin-panel-hackx-backend.onrender.com/api/admin/generate-all-qrs/stream" />
      <StreamTerminal open={showMail} setOpen={(v) => { setShowMail(v); setRetryMode(false); }} title={retryMode ? "SYSTEM::RETRY_ENGINE" : "SYSTEM::MAIL_DISPATCH"} color={THEME.success} url={retryMode ? "http://localhost:5000/api/admin/retry-failed-mails/stream" : "http://localhost:5000/api/admin/send-all-leader-mails/stream"} />

      {/* Navbar */}
      <nav style={{ padding: isMobile ? "12px 16px" : "16px 40px", borderBottom: `1px solid ${THEME.border}`, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ letterSpacing: "-1px", margin: 0, fontSize: isMobile ? "16px" : "20px" }}>
            HACK<span style={{ color: THEME.accent }}>X</span> <span style={{ fontWeight: 300, color: THEME.muted }}>CONSOLE</span>
          </h2>

          {isMobile ? (
            /* Hamburger button for mobile */
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              style={{ background: "transparent", border: `1px solid ${THEME.border}`, borderRadius: "4px", color: THEME.text, cursor: "pointer", padding: "6px 10px", fontSize: "18px", lineHeight: 1 }}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          ) : (
            /* Inline buttons for desktop/tablet */
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: isTablet ? "wrap" : "nowrap", justifyContent: "flex-end" }}>
              {navActions}
            </div>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {isMobile && mobileMenuOpen && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", paddingTop: "12px", borderTop: `1px solid ${THEME.border}` }}>
            {navActions}
          </div>
        )}
      </nav>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "20px 16px" : "40px" }}>
        {/* Stats grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? "12px" : "20px",
          marginBottom: isMobile ? "24px" : "40px"
        }}>
          {[
            { label: "Total Registrations", value: stats.total, color: THEME.text },
            { label: "Delivery Success", value: stats.sent, color: THEME.success },
            { label: "Delivery Failures", value: stats.failed, color: THEME.accent },
            { label: "Remaining", value: stats.pending, color: THEME.muted }
          ].map((s, i) => (
            <div key={i} style={{ background: THEME.surface, padding: isMobile ? "14px" : "20px", borderRadius: "12px", border: `1px solid ${THEME.border}` }}>
              <div style={{ fontSize: "11px", color: THEME.muted, marginBottom: "8px", textTransform: "uppercase", fontWeight: 700, lineHeight: 1.3 }}>{s.label}</div>
              <div style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: isMobile ? "20px" : "32px" }}>
          <input
            type="text"
            placeholder="Filter by team, leader, or contact details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: isMobile ? "12px 16px" : "16px 20px", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", color: "#fff", outline: "none", fontSize: isMobile ? "14px" : "15px", boxSizing: "border-box" }}
          />
        </div>

        {/* Team cards grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px", color: THEME.muted }}>Initializing interface...</div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
              ? "repeat(auto-fill, minmax(300px, 1fr))"
              : "repeat(auto-fill, minmax(380px, 1fr))",
            gap: isMobile ? "16px" : "24px"
          }}>
            {filteredTeams.map((team, index) => (
              <TeamCard key={team._id} team={team} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}