import "./VideoCard.css";
import { videoApi } from "../services/api";

const STATUS_MAP = {
  created: { label: "Created", color: "#666" },
  lrc: { label: "LRC Added", color: "#f59e0b" },
  rendered: { label: "Rendered", color: "#22c55e" },
  done: { label: "Done", color: "#22c55e" },
  rendering: { label: "Rendering...", color: "#3b82f6" },
};

export default function VideoCard({ video }) {
  const status = STATUS_MAP[video.status] || STATUS_MAP.created;
  const downloadVideo = async (id) => {
    const blob = await videoApi.download({ id });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${video.title}.mp4`;
    link.click();
  };
  return (
    <div className="video-card">
      <div className="video-thumb">
        {video.backgroundUrl ? (
          <img src={video.backgroundPath} alt={video.title} />
        ) : (
          <div className="video-thumb-placeholder">
            <span className="thumb-note">♬</span>
          </div>
        )}
        {/* <div className="thumb-overlay">
          <div className="thumb-play">▶</div>
        </div> */}
        {video.isShort && <span className="short-badge">SHORT</span>}
      </div>

      <div className="video-info">
        <div className="video-title">{video.title || "Untitled"}</div>
        <div className="video-meta">
          <span className="video-artist">{video.artist || "Unknown Artist"}</span>
          {video.createdAt && (
            <span className="video-date">
              {new Date(video.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="video-footer">
          <span
            className="video-status"
            style={{ color: status.color, borderColor: status.color + "40", background: status.color + "10" }}
          >
            {status.label}
          </span>
          <div className="video-actions">
            <button className="btn-icon" title="Download" onClick={() => downloadVideo(video.id)}>
              ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
