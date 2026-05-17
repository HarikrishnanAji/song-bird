import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

const NAV = [
  {
    to: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    label: "Dashboard",
  },
  {
    to: "/create",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    label: "Create Video",
    highlight: true,
  },
    {
    to: "/srt-editor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    label: "SRT Editor",
  },
  {
    to: "/library",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
      </svg>
    ),
    label: "Video Library",
  },
];

const EXTRA = [
  { icon: "♪", label: "Audio Files" },
  { icon: "◈", label: "LRC Files" },
  { icon: "⬡", label: "SRT Files" },
  { icon: "✦", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <span className="logo-bars">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </span>
        </div>
        <div className="logo-text">
          <span className="logo-main">Song Bird</span>
          <span className="logo-sub">Video Studio</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""} ${item.highlight ? "highlight" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.highlight && <span className="nav-badge">NEW</span>}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 24 }}>Files</div>
        {EXTRA.map((e) => (
          <div key={e.label} className="nav-item nav-extra">
            <span className="nav-icon-text">{e.icon}</span>
            <span className="nav-label">{e.label}</span>
          </div>
        ))}
      </nav>

      {/* Equalizer visualizer */}
      {/* <div className="sidebar-viz">
        <div className="viz-label">Now Playing</div>
        <div className="viz-bars">
          {Array(16).fill(0).map((_, i) => (
            <span key={i} className="viz-bar" style={{
              animationDelay: `${(i * 0.07).toFixed(2)}s`,
              animationDuration: `${0.5 + (i % 5) * 0.15}s`,
            }} />
          ))}
        </div>
        <div className="viz-track">
          <span className="viz-dot" />
          <span className="viz-title">No track loaded</span>
        </div>
      </div> */}

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-avatar">LF</div>
        <div className="user-info">
          <div className="user-name">Studio User</div>
          {/* <div className="user-plan">Pro Plan</div> */}
        </div>
      </div>
    </aside>
  );
}
