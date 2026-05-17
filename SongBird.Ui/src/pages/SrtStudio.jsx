import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SrtTimeline from "../components/srt/SrtTimeline.jsx";
import SrtEditor from "../components/srt/SrtEditor.jsx";
import SrtPreview from "../components/srt/SrtPreview.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMusic} from "@fortawesome/free-solid-svg-icons";
import "./SrtStudio.css";

export default function SrtStudio() {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  // SRT data: array of { id, start (ms), end (ms), text }
  const [subtitles, setSubtitles] = useState([
    { id: 1, start: 0, end: 3000, text: "Welcome to LyricForge" },
    { id: 2, start: 3000, end: 6000, text: "Create stunning lyric videos" },
  ]);

  const [selectedId, setSelectedId] = useState(1);
  const [audioFile, setAudioFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [zoom, setZoom] = useState(1);

  const selected = subtitles.find((s) => s.id === selectedId);

  // Handle audio file upload
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioFile({ name: file.name, url });
      if (audioRef.current) audioRef.current.src = url;
    }
  };

  // Audio time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime * 1000);
    const handleLoadedMetadata = () => setDuration(audio.duration * 1000);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Jump to time
  const jumpToTime = (ms) => {
    if (audioRef.current) {
      audioRef.current.currentTime = ms / 1000;
    }
  };

  // Update selected subtitle
  const updateSubtitle = (updates) => {
    setSubtitles((subs) =>
      subs.map((s) => (s.id === selectedId ? { ...s, ...updates } : s))
    );
  };

  // Add subtitle
  const addSubtitle = () => {
    const newId = Math.max(0, ...subtitles.map((s) => s.id)) + 1;
    const newStart = currentTime + 1000;
    const newEnd = newStart + 3000;
    setSubtitles([...subtitles, { id: newId, start: newStart, end: newEnd, text: "New subtitle" }]);
    setSelectedId(newId);
  };

  // Remove subtitle
  const removeSubtitle = () => {
    if (subtitles.length === 1) return;
    const remaining = subtitles.filter((s) => s.id !== selectedId);
    setSubtitles(remaining);
    setSelectedId(remaining[0].id);
  };

  // Export SRT
  const exportSRT = () => {
    const srtContent = subtitles
      .sort((a, b) => a.start - b.start)
      .map((sub, idx) => {
        const formatTime = (ms) => {
          const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
          const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
          const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
          const ms_ = String(Math.floor(ms % 1000)).padStart(3, "0");
          return `${h}:${m}:${s},${ms_}`;
        };
        return `${idx + 1}\n${formatTime(sub.start)} --> ${formatTime(sub.end)}\n${sub.text}`;
      })
      .join("\n\n");

    const blob = new Blob([srtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import SRT
  const importSRT = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const blocks = text.split(/\n\n+/);
      const parsed = [];
      let id = 1;

      blocks.forEach((block) => {
        const lines = block.trim().split(/\n/);
        if (lines.length >= 3) {
          const timeline = lines[1];
          const [startStr, endStr] = timeline.split(/\s*-->\s*/);

          const parseTime = (str) => {
            const match = str.match(/(\d+):(\d+):(\d+),(\d+)/);
            if (match) {
              const h = parseInt(match[1]) * 3600000;
              const m = parseInt(match[2]) * 60000;
              const s = parseInt(match[3]) * 1000;
              const ms = parseInt(match[4]);
              return h + m + s + ms;
            }
            return 0;
          };

          parsed.push({
            id: id++,
            start: parseTime(startStr),
            end: parseTime(endStr),
            text: lines.slice(2).join("\n"),
          });
        }
      });

      if (parsed.length > 0) {
        setSubtitles(parsed);
        setSelectedId(parsed[0].id);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="page srt-studio">
      <div className="page-header">
        <div className="tag">Tools</div>
        <h1>SRT SUBTITLE EDITOR</h1>
        <p>Sync subtitles frame-by-frame with visual timeline and live preview.</p>
      </div>

      <div className="srt-shell">
        {/* Left panel - Editor */}
        <div className="srt-left">
          <SrtEditor
            subtitle={selected}
            onUpdate={updateSubtitle}
            onAdd={addSubtitle}
            onRemove={removeSubtitle}
            allSubtitles={subtitles}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />

          {/* Import/Export */}
          <div className="srt-io">
            <label className="srt-io-btn import">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import SRT
              <input type="file" accept=".srt" onChange={importSRT} style={{ display: "none" }} />
            </label>
            <button className="srt-io-btn export" onClick={exportSRT}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export SRT
            </button>
          </div>
        </div>

        {/* Right panel - Timeline + Preview */}
        <div className="srt-right">
          {/* Audio upload */}
          <div className="audio-upload">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              style={{ display: "none" }}
              id="audio-input"
            />
            {audioFile ? (
              <div className="audio-info">
                <span className="audio-icon">🎵</span>
                <div>
                  <div className="audio-name">{audioFile.name}</div>
                  <div className="audio-duration">{(duration / 1000).toFixed(1)}s loaded</div>
                </div>
              </div>
            ) : (
              <label className="audio-placeholder" htmlFor="audio-input">
                <span className="placeholder-icon"><FontAwesomeIcon icon={faMusic} style={{ color: "#e8002d" }} /></span>
                <span className="placeholder-text">Drop audio file or click to upload</span>
                <span className="placeholder-sub">MP3, WAV, FLAC supported</span>
              </label>
            )}
          </div>

          {/* Player controls */}
          <div className="player-controls">
            <button className={`play-btn ${isPlaying ? "playing" : ""}`} onClick={togglePlay}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            <div className="time-display">
              <span className="current-time">{(currentTime / 1000).toFixed(2)}s</span>
              <span className="time-sep">/</span>
              <span className="total-time">{(duration / 1000).toFixed(2)}s</span>
            </div>
            <div className="zoom-control">
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}>−</button>
              <span className="zoom-val">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(3, zoom + 0.2))}>+</button>
            </div>
          </div>

          {/* Timeline */}
          <SrtTimeline
            subtitles={subtitles}
            currentTime={currentTime}
            duration={duration}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onSeek={jumpToTime}
            zoom={zoom}
            onUpdateTime={(id, start, end) => {
              setSubtitles((subs) =>
                subs.map((s) => (s.id === id ? { ...s, start, end } : s))
              );
            }}
          />

          {/* Preview */}
          <SrtPreview
            subtitles={subtitles}
            currentTime={currentTime}
            selectedId={selectedId}
          />
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Action footer */}
      <div className="srt-footer">
        <button className="btn-ghost" onClick={() => navigate("/library")}>
          ← Back to Library
        </button>
        <button className="btn-primary" onClick={exportSRT}>
          ✓ Export & Use in Step 3
        </button>
      </div>
    </div>
  );
}
