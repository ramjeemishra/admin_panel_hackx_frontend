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

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoBox}>
          <Zap fill="#FF1801" color="#FF1801" size={28} />
          <h1 style={styles.title}>F1 <span style={{ color: "#FF1801" }}>Monitoring Page</span></h1>
        </div>
        
        <div style={styles.telemetry}>
          <span>💞 Fast as Fuck 💞</span>
          <div style={styles.blink} />
        </div>
      </header>

      <nav style={styles.nav}>
        {[
          { id: "ATTENDANCE", label: "ATTENDANCE", icon: <UserCheck size={16}/> },
          { id: "FOOD", label: "FOOD", icon: <Utensils size={16}/> },
          { id: "LEADS", label: "LEADS", icon: <Trophy size={16}/> },
          { id: "MEMBERS", label: "MEMBERS", icon: <Users size={16}/> },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ skewX: -10, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSection(tab.id); setPage(1); }}
            style={{
              ...styles.tab,
              background: section === tab.id ? "#FF1801" : "#15151e",
              borderBottom: section === tab.id ? "4px solid #fff" : "4px solid transparent",
            }}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </nav>

      <div style={styles.filterSection}>
        {section === "ATTENDANCE" && (
          <select style={styles.select} value={attendanceFilter} onChange={(e) => setAttendanceFilter(e.target.value)}>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        )}

        {section === "FOOD" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{...styles.subBtn, opacity: foodReceived ? 1 : 0.5}} onClick={() => setFoodReceived(true)}>Served</button>
            <button style={{...styles.subBtn, opacity: !foodReceived ? 1 : 0.5}} onClick={() => setFoodReceived(false)}>EMPTY</button>
            <select style={styles.select} value={mealType} onChange={(e) => setMealType(e.target.value)}>
              <option value="BREAKFAST">BREAKFAST</option>
              <option value="LUNCH">LUNCH</option>
              <option value="DINNER">DINNER</option>
            </select>
          </div>
        )}

        {section === "LEADS" && (
          <select style={styles.select} value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)}>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        )}

        {section === "MEMBERS" && (
          <select style={styles.select} value={memberRoleFilter} onChange={(e) => setMemberRoleFilter(e.target.value)}>
            <option value="ALL">ALL</option>
            <option value="LEADER">LEADER</option>
            <option value="MEMBER">MEMBER</option>
          </select>
        )}
      </div>

      <main style={styles.main}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.status}>LOADING ENGINE...</motion.div>
          ) : (
            <motion.div
              key={section + page}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              style={styles.grid}
            >
              {paginatedData.map((item: any, i: number) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 5, backgroundColor: "#1f1f27" }}
                  style={styles.card}
                >
                  <div style={styles.cardRank}>{((page - 1) * PAGE_SIZE) + i + 1}</div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardTop}>
                      <span style={styles.code}>{item.teamCode || "F1"}</span>
                      <span style={styles.name}>{item.name || item.lead.name}</span>
                    </div>
                    <div style={styles.cardBottom}>{item.role} | {item.email || item.teamName}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={styles.footer}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={styles.pageBtn}><ChevronLeft/></button>
        <span style={styles.pageText}>LAP {page} / {totalPages || 1}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={styles.pageBtn}><ChevronRight/></button>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#0b0b0f",
    backgroundImage: "radial-gradient(circle at 2px 2px, #1a1a1a 1px, transparent 0)",
    backgroundSize: "32px 32px",
    minHeight: "100vh",
    color: "#fff",
    padding: "20px 5%",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: "1px solid #2d2d37",
    paddingBottom: 20,
  },
  logoBox: { display: "flex", alignItems: "center", gap: 12 },
  title: { fontSize: 28, fontWeight: 900, letterSpacing: -1, margin: 0 },
  telemetry: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#FF1801", fontWeight: 700 },
  blink: { width: 8, height: 8, borderRadius: "50%", background: "#FF1801" },
  nav: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 30 },
  tab: {
    padding: "15px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    fontStyle: "italic",
  },
  filterSection: { marginBottom: 20, display: "flex", gap: 10 },
  select: {
    background: "#15151e",
    color: "#fff",
    border: "1px solid #2d2d37",
    padding: "10px 20px",
    borderRadius: 0,
    fontWeight: 600,
  },
  subBtn: { background: "#2d2d37", color: "#fff", border: "none", padding: "10px 15px", cursor: "pointer", fontWeight: 700 },
  main: { minHeight: "50vh" },
  grid: { display: "flex", flexDirection: "column", gap: 8 },
  card: {
    background: "#15151e",
    display: "flex",
    alignItems: "center",
    borderLeft: "4px solid #FF1801",
    padding: "12px 20px",
    transition: "0.2s",
  },
  cardRank: { fontSize: 24, fontWeight: 900, color: "#2d2d37", width: 50, fontStyle: "italic" },
  cardBody: { flex: 1 },
  cardTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  code: { background: "#fff", color: "#000", fontSize: 10, fontWeight: 900, padding: "2px 5px" },
  name: { fontSize: 18, fontWeight: 700, textTransform: "uppercase" },
  cardBottom: { fontSize: 12, color: "#888", fontWeight: 500 },
  footer: { display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 40, paddingBottom: 40 },
  pageBtn: { background: "#15151e", border: "1px solid #2d2d37", color: "#fff", padding: 10, cursor: "pointer" },
  pageText: { fontWeight: 800, color: "#FF1801", fontStyle: "italic" },
  status: { textAlign: "center", padding: 100, fontWeight: 800, letterSpacing: 2 },
};