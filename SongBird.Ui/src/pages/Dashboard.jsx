import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { videoApi } from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faGuitar,faVideo,faCircleCheck,faMusic,faMobileScreen,faRotate} from "@fortawesome/free-solid-svg-icons";
import WaveformDecor from "../components/WaveformDecor.jsx";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    videoApi.getAll()
      .then(setVideos)
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Videos", value: loading ? "—" : videos.length, icon: (<FontAwesomeIcon icon={faVideo} style={{ color: "#e8002d" }} />), delta: "+3 this week" },
    { label: "Renders Done", value: loading ? "—" : videos.filter(v => v.rendered || v.status === "done").length, icon: (<FontAwesomeIcon icon={faCircleCheck} style={{ color: "#e8002d" }} />), delta: "Ready to download" },
    { label: "LRC Synced", value: loading ? "—" : videos.filter(v => v.lrcUploaded || v.hasLrc).length, icon: (<FontAwesomeIcon icon={faMusic} style={{ color: "#e8002d" }} />), delta: "Lyrics attached" },
    { label: "Short Videos", value: loading ? "—" : videos.filter(v => v.isShort).length, icon: (<FontAwesomeIcon icon={faMobileScreen} style={{ color: "#e8002d" }} />), delta: "Reels format" },
  ];

  const recent = videos.slice(0, 4);

  return (
    <div className="page dashboard">
      {/* Hero banner */}
      <div className="dash-hero">
        <WaveformDecor />
        <div className="dash-hero-content">
          <div className="tag">Studio Dashboard</div>
          <h1 className="dash-hero-title">
            Song Bird<br />
            <span className="hero-outline">VIDEO EDITOR</span>
          </h1>
          <p className="dash-hero-sub">
            Upload audio, sync lyrics, render stunning videos — all in three steps.
          </p>
          <button className="btn-primary" onClick={() => navigate("/create")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Create New Video
          </button>
        </div>
        <div className="dash-hero-art">
          <div className="vinyl-record">
            <div className="vinyl-outer" />
            <div className="vinyl-groove" />
            <div className="vinyl-label">
              <span className="vinyl-note">
                {/* ♪ */}
                {/* <FontAwesomeIcon icon={faGuitar} style={{"--fa-primary-color": "rgb(0, 0, 0)", "--fa-secondary-color": "rgb(255, 255, 255)", "--fa-secondary-opacity": "1",}} /> */}
                <div style={{ position: "relative", display: "inline-block" }}>
  <FontAwesomeIcon
    icon={faGuitar}
    style={{
      color: "white",
      fontSize: "40px",
      position: "absolute",
      left: "2px",
      top: "2px",
    }}
  />

  <FontAwesomeIcon
    icon={faGuitar}
    style={{
      color: "black",
      fontSize: "40px",
    }}
  />
</div>
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              </span>
            </div>
            {/* <div className="vinyl-arm" /> */}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Music ticker */}
      <div className="music-ticker">
        <div className="ticker-track">
          {Array(2).fill(["MP3", "LRC", "SRT"]).flat().map((f, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-note">♬</span> {f} Supported
            </span>
          ))}
        </div>
      </div>

      {/* Recent videos */}
      <div className="section-header">
        <h2>Recent Videos</h2>
        <button className="btn-ghost" onClick={() => navigate("/library")}>View All</button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading your videos...</span>
        </div>
      ) : recent.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FontAwesomeIcon icon={faMusic} style={{ color: "#e8002d" }} /></div>
          <h3>No videos yet</h3>
          <p>Create your first lyric video to get started.</p>
          <button className="btn-primary" onClick={() => navigate("/create")}>Create First Video</button>
        </div>
      ) : (
        <div className="video-grid">
          {recent.map((v, i) => <VideoCard key={v.id || i} video={v} />)}
        </div>
      )}

      {/* How it works */}
      <div className="how-it-works">
        <div className="section-header"><h2>How It Works</h2></div>
        <div className="steps-row">
          {[
            { num: "01", icon: (<FontAwesomeIcon icon={faMusic} style={{ color: "#e8002d" }} />), title: "Upload Audio", desc: "Add your MP3, WAV, or FLAC audio file along with a background image and video title." },
            { num: "02", icon: (<FontAwesomeIcon icon={faRotate} style={{color: "#e8002d",}} />), title: "Sync Lyrics", desc: "Upload an LRC file with timestamps to automatically sync your lyrics to the music." },
            { num: "03", icon: (<FontAwesomeIcon icon={faVideo} style={{ color: "#e8002d" }} />), title: "Render Video", desc: "Attach an SRT subtitle file and choose full-length or Shorts format. We'll do the rest." },
          ].map((step) => (
            <div className="step-card" key={step.num}>
              <div className="step-num">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              <div className="step-line" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
