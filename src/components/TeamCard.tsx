import { useState } from "react";
import { Team } from "../api/team.api";

const f1ButtonStyle = (color: string, isWhite = false) => ({
  width: "100%",
  background: color,
  color: isWhite ? "#000" : "#fff",
  border: "none",
  padding: "14px 0",
  fontSize: 14,
  fontWeight: 900,
  fontStyle: "italic",
  textTransform: "uppercase" as const,
  cursor: "pointer",
  clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)",
});

function TeamDetailsModal({ team, onClose }: { team: any; onClose: () => void }) {
  const SectionHeader = ({ title }: { title: string }) => (
    <div style={{ color: "#e10600", fontSize: 11, fontWeight: 900, letterSpacing: 2, marginBottom: 12, borderBottom: "1px solid #2d3748", paddingBottom: 4 }}>
      {title.toUpperCase()}
    </div>
  );

  const formatDateIST = (dateValue: any) => {
    const timestamp = dateValue?.$date || dateValue;
    if (!timestamp) return "NOT RECORDED";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "INVALID LOG";

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    }).format(date).toUpperCase().replace(/,/g, '');
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: "800px", maxHeight: "90vh", background: "#0b1019", border: "1px solid #e10600", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", background: "#e10600", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800 }}>TECHNICAL SPECIFICATION</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontStyle: "italic" }}>{team.teamName}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "2px solid #fff", color: "#fff", padding: "4px 12px", cursor: "pointer", fontWeight: 900 }}>CLOSE [X]</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 24, color: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <SectionHeader title="Core Telemetry" />
              <p style={{ fontSize: 13, color: "#94a3b8" }}>ID: <span style={{ color: "#fff" }}>{team._id.$oid || team._id}</span></p>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Code: <span style={{ color: "#fff", fontFamily: "monospace", fontSize: 11 }}>{team.teamCode}</span></p>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Attendance: <span style={{ color: team.attendance ? "#22c55e" : "#ef4444" }}>{team.attendance ? "VERIFIED" : "PENDING"}</span></p>

              <div style={{ marginTop: 24 }}>
                <SectionHeader title="Team Principal (Lead)" />
                <div style={{ background: "#151921", padding: 12, borderLeft: "4px solid #e10600" }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{team.lead.name}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>{team.lead.email}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>{team.lead.phone} | {team.lead.gender}</div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader title="Pit Stop Logistics (Food)" />
              {['BREAKFAST', 'LUNCH', 'DINNER'].map(meal => (
                <div key={meal} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#475569" }}>{meal}</div>
                  <div style={{ fontSize: 13 }}>
                    {team.foodStatus?.[meal]?.length > 0 ? (
                      <span style={{ color: "#22c55e" }}>
                        {team.foodStatus[meal]
                          .map((email: string) => {
                            const member = team.members.find(
                              (m: any) => m.email === email
                            );

                            return member ? member.fullName.toUpperCase() : "UNKNOWN";
                          })
                          .join(", ")}
                      </span>
                    ) : (
                      <span style={{ color: "#475569" }}>No logs recorded</span>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 24 }}>
                <SectionHeader title="System Timestamps (IST)" />
                <div style={{ display: 'grid', gap: '8px', background: '#05080f', padding: '12px', border: '1px solid #1a202c' }}>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    CREATED: <span style={{ color: "#fff", fontWeight: 700 }}>{formatDateIST(team.createdAt)}</span>
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    UPDATED: <span style={{ color: "#fff", fontWeight: 700 }}>{formatDateIST(team.updatedAt)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <SectionHeader title="Full Crew Roster" />
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#475569", borderBottom: "1px solid #2d3748" }}>
                  <th style={{ padding: 8 }}>#</th>
                  <th style={{ padding: 8 }}>FULL NAME</th>
                  <th style={{ padding: 8 }}>EMAIL</th>
                  <th style={{ padding: 8 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map((m: any, i: number) => (
                  <tr key={i} style={{ borderBottom: "1px solid #1a202c" }}>
                    <td style={{ padding: 12, color: "#e10600", fontWeight: 900 }}>{String(i + 1).padStart(2, '0')}</td>
                    <td style={{ padding: 12, fontWeight: 700 }}>{m.fullName.toUpperCase()}</td>
                    <td style={{ padding: 12, color: "#94a3b8" }}>{m.email}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ background: m.present ? "#064e3b" : "#450a0a", color: m.present ? "#34d399" : "#f87171", padding: "2px 8px", fontSize: 10, fontWeight: 900 }}>
                        {m.present ? "PRESENT" : "ABSENT"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamCard({ team, index }: { team: Team; index: number }) {
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mailLoading, setMailLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const people = [
    { name: team.lead.name, email: team.lead.email, role: "LEADER" },
    ...(team.members ?? []).map((m) => ({
      name: m.fullName, email: m.email, role: "MEMBER"
    })),
  ];

  const generateQR = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://admin-panel-hackx-backend.onrender.com/api/teams/${team._id}/qrs`);
      const data = await res.json();
      setQr(Array.isArray(data) ? data[0]?.qr : data.qr);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const sendTestMail = async () => {
    setMailLoading(true);
    try {
      await fetch(`https://admin-panel-hackx-backend.onrender.com/api/admin/send-qr-mail/${team._id}`, { method: "POST" });
      alert(`Radio check: Mail sent to ${team.lead.email}`);
    } catch (err) { alert("Pit stop error: Mail failed"); }
    finally { setMailLoading(false); }
  };

  return (
    <>
      {showDetails && <TeamDetailsModal team={team} onClose={() => setShowDetails(false)} />}

      <div style={{ background: "#151921", border: "1px solid #2d3748", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ padding: "24px 24px 12px 24px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 16, background: "#e10600" }} />
            <span style={{ color: "#718096", fontSize: 12, fontWeight: 700 }}>OFFICIAL CONSTRUCTOR</span>
          </div>
          <h3 style={{ margin: "8px 0", fontSize: 24, fontWeight: 900, fontStyle: "italic", color: "#fff", textTransform: "uppercase" }}>{team.teamName}</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#cbd5e0" }}>CHIEF ENGINEER: <span style={{ fontWeight: 800 }}>{team.lead.name.toUpperCase()}</span></p>
          <div style={{ position: "absolute", top: 10, right: 20, fontSize: 40, fontWeight: 900, fontStyle: "italic", color: "rgba(255,255,255,0.05)", pointerEvents: "none" }}>#{index + 1}</div>
        </div>

        <div style={{ padding: "0 24px" }}>
          <button onClick={() => setShowDetails(true)} style={{ background: "#2d3748", color: "#fff", border: "none", padding: "4px 12px", fontSize: 10, fontWeight: 900, cursor: "pointer", fontStyle: "italic", clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}>VIEW FULL SPECIFICATIONS →</button>
        </div>

        <div style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #2d3748", marginTop: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#718096" }}>CREW ROSTER</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#718096" }}>POSITION</span>
        </div>

        <div style={{ padding: "0 16px 16px", maxHeight: 180, overflowY: "auto" }}>
          {people.map((p, i) => (
            <div key={i} style={{ background: "#1a202c", border: "1px solid #2d3748", padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ color: "#e10600", fontWeight: 900 }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 13, fontStyle: "italic" }}>{p.name.toUpperCase()}</div>
                  <div style={{ color: "#718096", fontSize: 11 }}>{p.email}</div>
                </div>
              </div>
              <div style={{ background: p.role === "LEADER" ? "#e10600" : "#2d3748", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 8px", fontStyle: "italic", clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0% 100%)" }}>{p.role}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "0 24px 24px", display: "grid", gap: 12 }}>
          <button onClick={generateQR} disabled={loading} style={f1ButtonStyle("#fff", true)}>{loading ? "PROCESSING..." : "GENERATE TEAM QR"}</button>
          <button onClick={sendTestMail} disabled={mailLoading} style={f1ButtonStyle("#e10600")}>{mailLoading ? "TRANSMITTING..." : "SEND QR MAIL (TEST)"}</button>
        </div>

        {qr && (
          <div style={{ padding: "0 24px 24px", textAlign: "center" }}>
            <div style={{ background: "#fff", padding: 12, display: "inline-block" }}>
              <img src={qr} alt="QR" style={{ width: 140 }} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}