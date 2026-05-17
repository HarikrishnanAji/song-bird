import { useState } from "react";
import { videoApi } from "../../services/api.js";
import DropZone from "../DropZone.jsx";
import "./Steps.css";

export default function Step3Render({ videoId, videoMeta, onDone, onBack }) {
  const [isShort, setIsShort] = useState(false);
  const [srtFile, setSrtFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    // Simulate progress ticks while waiting for API
    const ticker = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8, 90));
    }, 600);

    try {
      await videoApi.render({ id: videoId, isShort, srtFile: srtFile || undefined });
      clearInterval(ticker);
      setProgress(100);
      setTimeout(() => onDone(), 600);
    } catch (e) {
      clearInterval(ticker);
      setError(e.message || "Render failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-panel">
      <div className="step-panel-header">
        <div className="step-panel-icon">🎬</div>
        <div>
          <h2>Render Your Video</h2>
          <p>Choose your output format and optionally attach SRT subtitles. We'll render your lyric video.</p>
        </div>
      </div>

      {/* Video summary */}
      <div className="video-summary">
        <div className="vs-row">
          <span className="vs-label">Title</span>
          <span className="vs-val">{videoMeta.title || "—"}</span>
        </div>
        <div className="vs-row">
          <span className="vs-label">Artist</span>
          <span className="vs-val">{videoMeta.artist || "—"}</span>
        </div>
        <div className="vs-row">
          <span className="vs-label">Video ID</span>
          <span className="vs-val vs-id">{videoId}</span>
        </div>
      </div>

      {/* Format selection */}
      <div className="format-selection">
        <div className="format-label">Output Format</div>
        <div className="format-options">
          <button
            className={`format-option ${!isShort ? "selected" : ""}`}
            onClick={() => setIsShort(false)}
          >
            <div className="format-preview landscape">
              <div className="fp-bars">
                {[60, 80, 50, 90, 70].map((h, i) => (
                  <span key={i} className="fp-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="format-name">Full Length</div>
            <div className="format-desc">16:9 · Standard landscape video for YouTube</div>
            {!isShort && <div className="format-check">✓</div>}
          </button>

          <button
            className={`format-option ${isShort ? "selected" : ""}`}
            onClick={() => setIsShort(true)}
          >
            <div className="format-preview portrait">
              <div className="fp-bars">
                {[60, 80, 50, 90, 70].map((h, i) => (
                  <span key={i} className="fp-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="format-name">Short / Reel</div>
            <div className="format-desc">9:16 · Vertical format for Shorts & Reels</div>
            {isShort && <div className="format-check">✓</div>}
          </button>
        </div>
      </div>

      {/* SRT upload */}
      <div className="form-field" style={{ marginTop: 24 }}>
        <label className="field-label">
          <span className="label-icon">⬡</span> SRT Subtitle File
          <span className="label-optional">Optional</span>
        </label>
        <DropZone
          accept=".srt"
          label="Drop your .srt subtitle file"
          subLabel="SubRip Text format — adds styled subtitles to the video"
          icon="💬"
          file={srtFile}
          onFile={setSrtFile}
        />
      </div>

      {/* Render progress */}
      {loading && (
        <div className="render-progress">
          <div className="rp-header">
            <span className="rp-label">Rendering...</span>
            <span className="rp-pct">{Math.round(progress)}%</span>
          </div>
          <div className="rp-track">
            <div className="rp-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="rp-stages">
            {["Processing audio", "Syncing lyrics", "Compositing", "Encoding", "Finalising"].map((s, i) => (
              <span key={s} className={`rp-stage ${progress > i * 20 ? "done" : ""}`}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {error && <div className="step-error">⚠ {error}</div>}

      <div className="step-actions">
        <button className="btn-ghost" onClick={onBack} disabled={loading}>← Back</button>
        <div className="step-tip">
          <span className="tip-icon">⚡</span>
          Rendering typically takes 1–3 minutes depending on video length.
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <><span className="btn-spinner" /> Rendering...</>
          ) : (
            <>🎬 Render Video</>
          )}
        </button>
      </div>
    </div>
  );
}
