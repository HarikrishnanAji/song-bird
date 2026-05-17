import { useState } from "react";
import { videoApi } from "../../services/api.js";
import DropZone from "../DropZone.jsx";
import "./Steps.css";

export default function Step2Lyrics({ videoId, initialTitle, onDone, onBack }) {
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState(initialTitle || "");
  const [lrcFile, setLrcFile] = useState(null);
  const [lrcPreview, setLrcPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const valid = artist.trim() && title.trim() && lrcFile;

  const handleLrcFile = (file) => {
    setLrcFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split("\n").slice(0, 12);
      setLrcPreview(lines);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      await videoApi.uploadLrc({
        id: videoId,
        artist: artist.trim(),
        title: title.trim(),
        lrcFile,
      });
      onDone({ artist: artist.trim(), title: title.trim() });
    } catch (e) {
      setError(e.message || "LRC upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-panel">
      <div className="step-panel-header">
        <div className="step-panel-icon">♪</div>
        <div>
          <h2>Sync Your Lyrics</h2>
          <p>Upload an LRC file with timestamps. The lyrics will be precisely synced to your audio track.</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="field-label"><span className="label-icon">♬</span> Artist Name *</label>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. The Weeknd"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label className="field-label"><span className="label-icon">✦</span> Track Title *</label>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. Blinding Lights"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-field full-width">
          <label className="field-label"><span className="label-icon">◈</span> LRC File *</label>
          <DropZone
            accept=".lrc"
            label="Drop your .lrc file here"
            subLabel="LRC format with [mm:ss.xx] timestamps"
            icon="♪"
            file={lrcFile}
            onFile={handleLrcFile}
          />
        </div>
      </div>

      {/* LRC preview */}
      {lrcPreview && (
        <div className="lrc-preview">
          <div className="lrc-preview-header">
            <span className="lrc-dot" />
            <span>LRC Preview</span>
            <span className="lrc-file-name">{lrcFile?.name}</span>
          </div>
          <div className="lrc-lines">
            {lrcPreview.map((line, i) => {
              const match = line.match(/^\[(\d+:\d+\.\d+)\](.*)/);
              return match ? (
                <div key={i} className="lrc-line">
                  <span className="lrc-time">[{match[1]}]</span>
                  <span className="lrc-text">{match[2]}</span>
                </div>
              ) : line.trim() ? (
                <div key={i} className="lrc-line lrc-meta">
                  <span className="lrc-text">{line}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* LRC format guide */}
      <div className="format-guide">
        <div className="guide-title">LRC Format Example</div>
        <div className="guide-code">
          {`[00:12.00] First line of lyrics\n[00:17.20] Second line of lyrics\n[00:21.10] Third line of lyrics`}
        </div>
      </div>

      {error && <div className="step-error">⚠ {error}</div>}

      <div className="step-actions">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <div className="step-tip">
          <span className="tip-icon">💡</span>
          Many music players and apps can export LRC files from synced lyrics.
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={!valid || loading}>
          {loading ? (
            <><span className="btn-spinner" /> Uploading Lyrics...</>
          ) : (
            <>Continue to Render <span>→</span></>
          )}
        </button>
      </div>
    </div>
  );
}
