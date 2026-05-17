import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { videoApi } from "../services/api.js";
import VideoCard from "../components/VideoCard.jsx";
import "./VideoLibrary.css";

const FILTERS = ["All", "Rendered", "Pending", "Shorts"];

export default function VideoLibrary() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    videoApi.getAll()
      .then(setVideos)
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = videos.filter((v) => {
    const matchSearch = !search || v.title?.toLowerCase().includes(search.toLowerCase()) ||
      v.artist?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" ? true :
      filter === "Rendered" ? (v.status === "rendered" || v.status === "done") :
      filter === "Pending" ? (v.status === "created" || v.status === "lrc") :
      filter === "Shorts" ? v.isShort : true;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page library-page">
      <div className="page-header">
        <div className="tag">Library</div>
        <h1>VIDEO LIBRARY</h1>
        <p>All your rendered lyric videos in one place.</p>
      </div>

      {/* Toolbar */}
      <div className="lib-toolbar">
        <div className="lib-search">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search by title or artist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="lib-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f === "All" && <span className="filter-count">{videos.length}</span>}
            </button>
          ))}
        </div>

        <button className="btn-primary" onClick={() => navigate("/create")}>
          + New Video
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading library...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{search ? "🔍" : "🎵"}</div>
          <h3>{search ? "No results found" : "Library is empty"}</h3>
          <p>{search ? `No videos match "${search}"` : "Create your first lyric video to populate your library."}</p>
          {!search && <button className="btn-primary" onClick={() => navigate("/create")}>Create First Video</button>}
        </div>
      ) : (
        <>
          <div className="lib-count">{filtered.length} video{filtered.length !== 1 ? "s" : ""}</div>
          <div className="video-grid lib-grid">
            {filtered.map((v, i) => <VideoCard key={v.id || i} video={v} />)}
          </div>
        </>
      )}

      {/* Stats bar */}
      {!loading && videos.length > 0 && (
        <div className="lib-stats-bar">
          <div className="lsb-item">
            <span className="lsb-val">{videos.length}</span>
            <span className="lsb-label">Total Videos</span>
          </div>
          <div className="lsb-divider" />
          <div className="lsb-item">
            <span className="lsb-val">{videos.filter(v => v.isShort).length}</span>
            <span className="lsb-label">Shorts</span>
          </div>
          <div className="lsb-divider" />
          <div className="lsb-item">
            <span className="lsb-val">{videos.filter(v => v.status === "done" || v.status === "rendered").length}</span>
            <span className="lsb-label">Rendered</span>
          </div>
        </div>
      )}
    </div>
  );
}
