import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UploadCSV from "./pages/UploadCSV";
import Filters from "./pages/Filters";
import LockScreen from "./pages/LockScreen";
import Admin from "./pages/Admin";

export default function App() {
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(
          `https://admin-panel-hackx-backend.onrender.com/api/super/status?t=${Date.now()}`
        );

        const data = await res.json();

        setLocked(data.allowed === false || data.forceLogout === true);
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1500);

    return () => clearInterval(interval);
  }, []);

  if (checking) return null;

  if (locked) return <LockScreen />;

  return (
    <Routes>
      <Route path="/" element={<Admin />} />
      <Route path="/upload-csv" element={<UploadCSV />} />
      <Route path="/filters" element={<Filters />} />
      <Route path="/admin" element={<Navigate to="/" replace />} />
    </Routes>
  );
}