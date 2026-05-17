import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThreeDot } from "react-loading-indicators";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import CreateVideo from "./pages/CreateVideo";
import SrtEditor from "./pages/SrtEditor";
import VideoLibrary from "./pages/VideoLibrary";

import "./App.css";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <ThreeDot
          color="#e8002d"
          size="small"
          text=""
          textColor=""
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateVideo />} />
          <Route path="/srt-editor" element={<SrtEditor />} />
          <Route path="/library" element={<VideoLibrary />} />
        </Routes>
      </main>
    </div>
  );
}