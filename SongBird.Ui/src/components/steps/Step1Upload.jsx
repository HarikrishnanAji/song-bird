import { useState, useRef } from "react";
import { videoApi } from "../../services/api.js";
import DropZone from "../DropZone.jsx";
import "./Steps.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faImage, faLightbulb, faMusic} from "@fortawesome/free-solid-svg-icons";

export default function Step1Upload({ onDone }) {
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const valid = title.trim() && audioFile;

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await videoApi.create({ audioFile, backgroundFile: bgFile, title: title.trim() });
      // API may return an object with an id field
      const id = res?.id || res?.videoId || res?.Id || crypto.randomUUID();
      onDone({ id, title: title.trim() });
    } catch (e) {
      setError(e.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-panel">
      <div className="step-panel-header">
        <div className="step-panel-icon"><FontAwesomeIcon icon={faMusic} style={{ color: "#e8002d" }} /></div>
        <div>
          <h2>Upload Your Audio & Background</h2>
          <p>Supported formats: MP3, WAV, FLAC, AAC, OGG, M4A for audio. JPG, PNG, WebP for background.</p>
        </div>
      </div>

      <div className="form-grid">
        {/* Title */}
        <div className="form-field full-width">
          <label className="field-label">
            <span className="label-icon">✦</span> Video Title *
          </label>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. Blinding Lights — The Weeknd"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Audio dropzone */}
        <div className="form-field">
          <label className="field-label">
            <span className="label-icon">♬</span> Audio File *
          </label>
          <DropZone
            accept="audio/*"
            label="Drop audio file here"
            subLabel="MP3, WAV, FLAC, AAC supported"
            icon={<FontAwesomeIcon icon={faMusic} style={{ color: "#e8002d" }} />}
            file={audioFile}
            onFile={setAudioFile}
          />
        </div>

        {/* Background dropzone */}
        <div className="form-field">
          <label className="field-label">
            <span className="label-icon">◈</span> Background Image *
          </label>
          <DropZone
            accept="image/*"
            label="Drop background image"
            subLabel="JPG, PNG, WebP — 1920×1080 recommended"
            icon={<FontAwesomeIcon icon={faImage} style={{ color: "#e8002d" }} />}
            file={bgFile}
            onFile={setBgFile}
          />
        </div>
      </div>

      {/* Audio preview */}
      {audioFile && (
        <div className="audio-preview">
          <div className="ap-icon">🎵</div>
          <div className="ap-info">
            <div className="ap-name">{audioFile.name}</div>
            <div className="ap-size">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
          <div className="ap-bars">
            {Array(8).fill(0).map((_, i) => (
              <span key={i} className="ap-bar" style={{ animationDelay: `${i * 0.07}s`, animationDuration: `${0.4 + (i % 4) * 0.1}s` }} />
            ))}
          </div>
          <button className="ap-remove" onClick={() => setAudioFile(null)}>✕</button>
        </div>
      )}

      {error && <div className="step-error">⚠ {error}</div>}

      <div className="step-actions">
        <div className="step-tip">
          <span className="tip-icon"><FontAwesomeIcon icon={faLightbulb} style={{ color: "#e8002d" }} /></span>
          Use high-quality lossless audio for the best results.
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={!valid || loading}>
          {loading ? (
            <><span className="btn-spinner" /> Uploading...</>
          ) : (
            <>Continue to Lyrics <span>→</span></>
          )}
        </button>
      </div>
    </div>
  );
}
