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
  Zap,
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
      list.push({
        role: "LEADER",
        name: team.lead?.name,
        email: team.lead?.email,
        present: team.attendance === true,
        teamCode: team.teamCode,
        attendance: team.attendance,
      });
      team.members?.forEach((m: any) => {
        list.push({
          role: "MEMBER",
          name: m.fullName,
          email: m.email,
          present: m.present === true,
          teamCode: team.teamCode,
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
        list.push({
          role: "LEADER",
          name: team.lead?.name,
          email: team.lead?.email,
          teamCode: team.teamCode,
        });
      }

      team.members?.forEach((m: any) => {
        const received = mealArray.includes(m.email);
        if (foodReceived ? received : !received) {
          list.push({
            role: "MEMBER",
            name: m.fullName,
            email: m.email,
            teamCode: team.teamCode,
          });
        }
      });

      return list;
    });
  }, [teams, mealType, foodReceived]);

  const leadData = useMemo(() => {
    return teams.filter((team) =>
      leadFilter === "PRESENT"
        ? team.attendance === true
        : team.attendance === false
    );
  }, [teams, leadFilter]);

  const memberData = useMemo(() => {
    return allParticipants.filter((p) =>
      memberRoleFilter === "ALL" ? true : p.role === memberRoleFilter
    );
  }, [allParticipants, memberRoleFilter]);

  const activeData =
    section === "ATTENDANCE"
      ? attendanceData
      : section === "FOOD"
      ? foodData
      : section === "LEADS"
      ? leadData
      : memberData;

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
          <h1 style={styles.title}>
            F1 <span style={{ color: "#FF1801" }}>Monitoring Page</span>
          </h1>
        </div>
        <span style={styles.telemetry}>Fast as fuck 💕💕</span>
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSection(tab.id);
              setPage(1);
            }}
            style={{
              ...styles.tab,
              background: section === tab.id ? "#FF1801" : "#15151e",
            }}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </nav>

      <div style={styles.filterSection}>
        {section === "ATTENDANCE" && (
          <select
            style={styles.select}
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
          >
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        )}

        {section === "FOOD" && (
          <>
            <button
              style={{
                ...styles.subBtn,
                opacity: foodReceived ? 1 : 0.5,
              }}
              onClick={() => setFoodReceived(true)}
            >
              SERVED
            </button>
            <button
              style={{
                ...styles.subBtn,
                opacity: !foodReceived ? 1 : 0.5,
              }}
              onClick={() => setFoodReceived(false)}
            >
              EMPTY
            </button>
            <select
              style={styles.select}
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="BREAKFAST">BREAKFAST</option>
              <option value="LUNCH">LUNCH</option>
              <option value="DINNER">DINNER</option>
            </select>
          </>
        )}

        {section === "LEADS" && (
          <select
            style={styles.select}
            value={leadFilter}
            onChange={(e) => setLeadFilter(e.target.value)}
          >
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        )}

        {section === "MEMBERS" && (
          <select
            style={styles.select}
            value={memberRoleFilter}
            onChange={(e) => setMemberRoleFilter(e.target.value)}
          >
            <option value="ALL">ALL</option>
            <option value="LEADER">LEADER</option>
            <option value="MEMBER">MEMBER</option>
          </select>
        )}
      </div>

      <main style={styles.main}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.loading}
            >
              LOADING...
            </motion.div>
          ) : (
            <motion.div
              key={section + page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={styles.grid}
            >
              {paginatedData.map((item: any, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3 }}
                  style={styles.card}
                >
                  <div style={styles.cardTop}>
                    <span style={styles.code}>
                      {item.teamCode || item.teamName}
                    </span>
                    <span
                      style={{
                        ...styles.roleBadge,
                        background:
                          item.role === "LEADER" ? "#FF1801" : "#2d2d37",
                      }}
                    >
                      {item.role || "TEAM"}
                    </span>
                  </div>

                  <div style={styles.name}>
                    {item.name || item.lead?.name}
                  </div>

                  <div style={styles.bottom}>
                    {section === "ATTENDANCE" && (
                      <span
                        style={{
                          ...styles.status,
                          background: item.present
                            ? "#064e3b"
                            : "#450a0a",
                          color: item.present
                            ? "#34d399"
                            : "#f87171",
                        }}
                      >
                        {item.present ? "PRESENT" : "ABSENT"}
                      </span>
                    )}

                    {section === "FOOD" && (
                      <span style={styles.status}>{mealType}</span>
                    )}

                    {section === "LEADS" && (
                      <span
                        style={{
                          ...styles.status,
                          background: item.attendance
                            ? "#064e3b"
                            : "#450a0a",
                          color: item.attendance
                            ? "#34d399"
                            : "#f87171",
                        }}
                      >
                        {item.attendance ? "VERIFIED" : "PENDING"}
                      </span>
                    )}

                    {section === "MEMBERS" && (
                      <span style={styles.email}>
                        {item.email}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={styles.footer}>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          style={styles.pageBtn}
        >
          <ChevronLeft size={18} />
        </button>
        <span style={styles.pageText}>
          LAP {page} / {totalPages || 1}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={styles.pageBtn}
        >
          <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#0b0b0f",
    minHeight: "100vh",
    color: "#fff",
    padding: "20px 5%",
    fontFamily: "system-ui",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  logoBox: { display: "flex", alignItems: "center", gap: 12 },
  title: { margin: 0, fontSize: 28, fontWeight: 900 },
  telemetry: { color: "#FF1801", fontWeight: 700 },
  nav: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 },
  tab: {
    padding: 15,
    border: "none",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  filterSection: { display: "flex", gap: 10, marginBottom: 20 },
  select: {
    background: "#15151e",
    color: "#fff",
    border: "1px solid #2d2d37",
    padding: "10px 15px",
  },
  subBtn: {
    background: "#2d2d37",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  main: { minHeight: "50vh" },
  grid: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: "linear-gradient(135deg,#15151e,#1b1b24)",
    border: "1px solid #2d2d37",
    padding: "18px 20px",
    borderLeft: "4px solid #FF1801",
  },
  cardTop: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  code: {
    background: "#fff",
    color: "#000",
    fontSize: 10,
    fontWeight: 900,
    padding: "3px 6px",
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: 900,
    padding: "4px 8px",
    color: "#fff",
  },
  name: { fontSize: 18, fontWeight: 800, textTransform: "uppercase" },
  bottom: { marginTop: 6 },
  status: {
    fontSize: 11,
    fontWeight: 900,
    padding: "4px 10px",
  },
  email: { fontSize: 12, color: "#888" },
  footer: {
    marginTop: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  pageBtn: {
    background: "#15151e",
    border: "1px solid #2d2d37",
    color: "#fff",
    padding: 10,
    cursor: "pointer",
  },
  pageText: { fontWeight: 900, color: "#FF1801" },
  loading: { textAlign: "center", padding: 100, fontWeight: 800 },
};