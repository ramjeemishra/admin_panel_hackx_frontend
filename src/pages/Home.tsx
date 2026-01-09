import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTeams, Team } from "../api/team.api";
import TeamCard from "../components/TeamCard";

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
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
    <div style={{ padding: "32px 24px" }}>
      {/* Header */}
      <header
        style={{
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 34 }}>
          HackX — Admin Panel
        </h1>

        <button
          onClick={() => navigate("/upload-csv")}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #e10600, #ff4d4d)",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Upload CSV
        </button>
      </header>

      {/* Content */}
      {loading ? (
        <p>Loading teams...</p>
      ) : teams.length === 0 ? (
        <p>No teams found</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
