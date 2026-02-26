// filters and stats page
import { useEffect, useMemo, useState } from "react";
import { fetchTeams } from "../api/team.api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Utensils,
  Trophy,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";

const PAGE_SIZE = 12;

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

export default function AdminDashboard() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("ATTENDANCE");
  const [page, setPage] = useState(1);

  const [attendanceFilter, setAttendanceFilter] = useState("PRESENT");
  const [foodReceived, setFoodReceived] = useState(true);
  const [mealType, setMealType] = useState("BREAKFAST");
  const [leadFilter, setLeadFilter] = useState("PRESENT");
  const [memberRoleFilter, setMemberRoleFilter] = useState("ALL");

  const isMobile = useMediaQuery("(max-width: 600px)");
  const isTablet = useMediaQuery("(max-width: 900px)");

  useEffect(() => {
    fetchTeams()
      .then((data) => {
        setTeams(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allParticipants = useMemo(() => {
    const list: any[] = [];
    teams.forEach((team) => {
      const teamCode = team.teamCode;
      const teamName = team.teamName;
      list.push({
        role: "LEADER",
        name: team.lead?.name,
        email: team.lead?.email,
        phone: team.lead?.phone,
        present: team.attendance === true,
        teamCode,
        teamName,
      });
      team.members?.forEach((m: any) => {
        list.push({
          role: "MEMBER",
          name: m.fullName,
          email: m.email,
          phone: m.phone,
          present: m.present === true,
          teamCode,
          teamName,
        });
      });
    });
    return list;
  }, [teams]);

  const attendanceData = useMemo(() => {
    return allParticipants.filter((p) =>
      attendanceFilter === "PRESENT" ? p.present === true : p.present === false
    );
  }, [allParticipants, attendanceFilter]);

  const foodData = useMemo(() => {
    return teams.flatMap((team) => {
      const list: any[] = [];
      const mealArray = team.foodStatus?.[mealType] || [];
      const leaderReceived = mealArray.includes(team.lead?.email);
      if (foodReceived ? leaderReceived : !leaderReceived) {
        list.push({ role: "LEADER", name: team.lead?.name, email: team.lead?.email, teamCode: team.teamCode });
      }
      team.members?.forEach((m: any) => {
        const received = mealArray.includes(m.email);
        if (foodReceived ? received : !received) {
          list.push({ role: "MEMBER", name: m.fullName, email: m.email, teamCode: team.teamCode });
        }
      });
      return list;
    });
  }, [teams, mealType, foodReceived]);

  const leadData = useMemo(() => {
    return teams.filter((team) =>
      leadFilter === "PRESENT" ? team.attendance === true : team.attendance === false
    );
  }, [teams, leadFilter]);

  const memberData = useMemo(() => {
    return allParticipants
      .filter((p) => memberRoleFilter === "ALL" ? true : p.role === memberRoleFilter)
      .sort((a, b) => a.teamCode.localeCompare(b.teamCode));
  }, [allParticipants, memberRoleFilter]);

  const activeData =
    section === "ATTENDANCE" ? attendanceData :
    section === "FOOD" ? foodData :
    section === "LEADS" ? leadData : memberData;

  const totalPages = Math.ceil(activeData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return activeData.slice(start, start + PAGE_SIZE);
  }, [activeData, page]);

  const tabs = [
    { id: "ATTENDANCE", label: "ATTENDANCE", shortLabel: "ATTN", icon: <UserCheck size={14} /> },
    { id: "FOOD", label: "FOOD", shortLabel: "FOOD", icon: <Utensils size={14} /> },
    { id: "LEADS", label: "LEADS", shortLabel: "LEADS", icon: <Trophy size={14} /> },
    { id: "MEMBERS", label: "MEMBERS", shortLabel: "MBR", icon: <Users size={14} /> },
  ];

  return (
    <div style={{
      backgroundColor: "#0b0b0f",
      backgroundImage: "radial-gradient(circle at 2px 2px, #1a1a1a 1px, transparent 0)",
      backgroundSize: "32px 32px",
      minHeight: "100vh",
      color: "#fff",
      padding: isMobile ? "16px" : "20px 5%",
      fontFamily: "system-ui, -apple-system, sans-serif",
      boxSizing: "border-box",
    }}>

      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: isMobile ? 20 : 30,
        borderBottom: "1px solid #2d2d37",
        paddingBottom: isMobile ? 14 : 20,
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap fill="#FF1801" color="#FF1801" size={isMobile ? 20 : 28} />
          <h1 style={{ fontSize: isMobile ? 18 : 28, fontWeight: 900, letterSpacing: -1, margin: 0 }}>
            F1 <span style={{ color: "#FF1801" }}>Monitoring</span>
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#FF1801", fontWeight: 700 }}>
          <span>💞 Fast as Fuck 💞</span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF1801" }} />
        </div>
      </header>

      {/* Nav tabs */}
      <nav style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: isMobile ? 6 : 10,
        marginBottom: isMobile ? 16 : 30,
      }}>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ skewX: -8, scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSection(tab.id); setPage(1); }}
            style={{
              padding: isMobile ? "10px 4px" : "15px",
              border: "none",
              background: section === tab.id ? "#FF1801" : "#15151e",
              borderBottom: section === tab.id ? "4px solid #fff" : "4px solid transparent",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: isMobile ? 10 : 14,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: isMobile ? 4 : 8,
              fontStyle: "italic",
              flexDirection: isMobile ? "column" : "row",
              textAlign: "center",
            }}
          >
            {tab.icon}
            <span>{isMobile ? tab.shortLabel : tab.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Filters */}
      <div style={{
        marginBottom: isMobile ? 16 : 20,
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}>
        {section === "ATTENDANCE" && (
          <select
            style={selectStyle}
            value={attendanceFilter}
            onChange={(e) => { setAttendanceFilter(e.target.value); setPage(1); }}
          >
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        )}

        {section === "FOOD" && (
          <>
            <button
              style={{ ...subBtnStyle, opacity: foodReceived ? 1 : 0.5 }}
              onClick={() => { setFoodReceived(true); setPage(1); }}
            >
              Served
            </button>
            <button
              style={{ ...subBtnStyle, opacity: !foodReceived ? 1 : 0.5 }}
              onClick={() => { setFoodReceived(false); setPage(1); }}
            >
              EMPTY
            </button>
            <select
              style={selectStyle}
              value={mealType}
              onChange={(e) => { setMealType(e.target.value); setPage(1); }}
            >
              <option value="HIGH_TEA">HIGH TEA</option>
              <option value="BREAKFAST">BREAKFAST</option>
              <option value="LUNCH">LUNCH</option>
              <option value="DINNER">DINNER</option>
            </select>
          </>
        )}

        {section === "LEADS" && (
          <select
            style={selectStyle}
            value={leadFilter}
            onChange={(e) => { setLeadFilter(e.target.value); setPage(1); }}
          >
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        )}

        {section === "MEMBERS" && (
          <select
            style={selectStyle}
            value={memberRoleFilter}
            onChange={(e) => { setMemberRoleFilter(e.target.value); setPage(1); }}
          >
            <option value="ALL">ALL</option>
            <option value="LEADER">LEADER</option>
            <option value="MEMBER">MEMBER</option>
          </select>
        )}

        {/* Count badge */}
        <div style={{
          marginLeft: "auto",
          background: "#15151e",
          border: "1px solid #2d2d37",
          padding: "8px 14px",
          fontWeight: 800,
          fontSize: 12,
          color: "#FF1801",
          fontStyle: "italic",
          display: "flex",
          alignItems: "center",
        }}>
          {activeData.length} ENTRIES
        </div>
      </div>

      {/* Main content */}
      <main style={{ minHeight: "50vh" }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: 100, fontWeight: 800, letterSpacing: 2 }}
            >
              LOADING ENGINE...
            </motion.div>
          ) : paginatedData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: 80, fontWeight: 800, letterSpacing: 2, color: "#2d2d37" }}
            >
              NO DATA FOUND
            </motion.div>
          ) : (
            <motion.div
              key={section + page}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}
            >
              {paginatedData.map((item: any, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ x: isMobile ? 2 : 5, backgroundColor: "#1f1f27" }}
                  style={{
                    background: "#15151e",
                    display: "flex",
                    alignItems: "center",
                    borderLeft: "4px solid #FF1801",
                    padding: isMobile ? "10px 12px" : "12px 20px",
                    transition: "0.2s",
                    gap: isMobile ? 8 : 0,
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    fontSize: isMobile ? 16 : 24,
                    fontWeight: 900,
                    color: "#2d2d37",
                    width: isMobile ? 36 : 50,
                    fontStyle: "italic",
                    flexShrink: 0,
                  }}>
                    {((page - 1) * PAGE_SIZE) + i + 1}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{
                        background: "#fff",
                        color: "#000",
                        fontSize: isMobile ? 9 : 10,
                        fontWeight: 900,
                        padding: "2px 5px",
                        flexShrink: 0,
                      }}>
                        {item.teamCode || "F1"}
                      </span>
                      <span style={{
                        fontSize: isMobile ? 14 : 18,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {item.name || item.lead?.name}
                      </span>
                    </div>
                    <div style={{
                      fontSize: isMobile ? 11 : 12,
                      color: "#888",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {item.role} | {item.email || item.teamName}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Pagination footer */}
      <footer style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: isMobile ? 12 : 20,
        marginTop: isMobile ? 24 : 40,
        paddingBottom: 40,
      }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          style={{
            background: "#15151e",
            border: "1px solid #2d2d37",
            color: page === 1 ? "#2d2d37" : "#fff",
            padding: isMobile ? 8 : 10,
            cursor: page === 1 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronLeft size={isMobile ? 16 : 20} />
        </button>
        <span style={{ fontWeight: 800, color: "#FF1801", fontStyle: "italic", fontSize: isMobile ? 13 : 16 }}>
          LAP {page} / {totalPages || 1}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(p => p + 1)}
          style={{
            background: "#15151e",
            border: "1px solid #2d2d37",
            color: page >= totalPages ? "#2d2d37" : "#fff",
            padding: isMobile ? 8 : 10,
            cursor: page >= totalPages ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronRight size={isMobile ? 16 : 20} />
        </button>
      </footer>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: "#15151e",
  color: "#fff",
  border: "1px solid #2d2d37",
  padding: "10px 16px",
  borderRadius: 0,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

const subBtnStyle: React.CSSProperties = {
  background: "#2d2d37",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};