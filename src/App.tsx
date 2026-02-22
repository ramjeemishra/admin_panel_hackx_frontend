import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UploadCSV from "./pages/UploadCSV";
import Filters from "./pages/Filters";
import LockScreen from "./pages/LockScreen";
import Admin from "./pages/Admin";

export default function App() {
  const APP_ID = "admin-panel";
  const BACKEND_URL = "https://admin-panel-hackx-backend.onrender.com";

  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let socket: WebSocket | null = null;

    const fetchInitialStatus = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/super/status?appId=${APP_ID}`
        );

        const data = await res.json();
        setLocked(data.allowed === false);
      } catch (err) {
        console.error("Initial status error:", err);
      } finally {
        setChecking(false);
      }
    };

    const connectWebSocket = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/super/ws-token?appId=${APP_ID}`
        );

        const { token } = await res.json();

        socket = new WebSocket(
          `wss://admin-panel-hackx-backend.onrender.com?token=${token}`
        );

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.appId === APP_ID) {
              setLocked(data.status === false);
            }
          } catch (err) {
            console.error("WebSocket message error:", err);
          }
        };

        socket.onerror = (err) => {
          console.error("WebSocket error:", err);
        };

        socket.onclose = () => {
          console.warn("WebSocket closed. Reconnecting in 3s...");
          setTimeout(connectWebSocket, 3000);
        };
      } catch (err) {
        console.error("WebSocket connection error:", err);
      }
    };

    fetchInitialStatus();
    connectWebSocket();

    return () => {
      if (socket) socket.close();
    };
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