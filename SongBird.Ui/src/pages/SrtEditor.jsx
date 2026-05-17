import { useState, useRef, useEffect } from "react";
import "./SrtEditor.css";

export default function SrtEditor() {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const lyricsInputRef = useRef(null);
  // Audio & playback
  const [audioFile, setAudioFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState(null);

  // Subtitles
  const [subs, setSubs] = useState([]);
  const [selectedSubIdx, setSelectedSubIdx] = useState(null);
  const [stampStartMs, setStampStartMs] = useState(null);

  // Real-time lyric input mode
  const [lyricsMode, setLyricsMode] = useState(false);
  const [lyricsText, setLyricsText] = useState("");
  const [lyricLines, setLyricLines] = useState([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [timestamps, setTimestamps] = useState([]);

  // UI
  const [copied, setCopied] = useState(false);

  // Load audio file
  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    const audio = audioRef.current;
    if (audio) {
      audio.src = url;
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        generateWaveform(file);
      };
    }
  };

  // Generate waveform visualization from audio file
  const generateWaveform = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(e.target.result, (buffer) => {
        const rawData = buffer.getChannelData(0);
        const samples = 512; // Number of bars in waveform
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];

        for (let i = 0; i < samples; i++) {
          let blockAverage = 0;
          for (let j = 0; j < blockSize; j++) {
            blockAverage += Math.abs(rawData[i * blockSize + j]);
          }
          filteredData.push(blockAverage / blockSize);
        }

        // Normalize to 0-1
        const max = Math.max(...filteredData);
        const normalized = filteredData.map((v) => v / max || 0);
        setWaveformData(normalized);
      });
    };
    reader.readAsArrayBuffer(file);
  };

  // Keyboard handler for lyrics mode (Enter = stamp, Space = pause/play)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lyricsMode || !isPlaying) return;

      if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        if (e.code === "Enter") {
          recordTimestamp();
        } else if (e.code === "Space") {
          if (audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause();
              setIsPlaying(false);
            } else {
              audioRef.current.play();
              setIsPlaying(true);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lyricsMode, isPlaying, currentLineIdx, lyricLines.length, currentTime]);
  useEffect(() => {
    if (!canvasRef.current || !waveformData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = "var(--bg-2)";
    ctx.fillRect(0, 0, width, height);

    // Draw subtitle regions
    ctx.fillStyle = "rgba(232, 0, 45, 0.15)";
    subs.forEach((sub) => {
      const startX = (sub.startMs / (duration * 1000)) * width;
      const endX = (sub.endMs / (duration * 1000)) * width;
      ctx.fillRect(startX, 0, endX - startX, height);
    });

    // Draw waveform bars
    const barWidth = width / waveformData.length;
    ctx.fillStyle = "rgba(232, 0, 45, 0.7)";

    waveformData.forEach((value, i) => {
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;
      ctx.fillRect(i * barWidth, y, Math.max(1, barWidth - 0.5), barHeight);
    });

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [waveformData, currentTime, duration, subs]);

  // Audio playback
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Subtitle management
  const addSubtitle = () => {
    const startMs = Math.round(currentTime * 1000);
    const endMs = startMs + 3000;
    const newSub = {
      id: Date.now(),
      num: subs.length + 1,
      startMs,
      endMs,
      text: "New subtitle",
    };
    setSubs([...subs, newSub]);
  };

  const updateSubtitle = (id, field, value) => {
    setSubs(
      subs.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              [field]: field.includes("Ms") ? Math.max(0, parseInt(value) || 0) : value,
            }
          : sub
      )
    );
  };

  const deleteSubtitle = (id) => {
    setSubs(subs.filter((sub) => sub.id !== id));
  };

  const stampTime = (id) => {
    const ms = Math.round(currentTime * 1000);
    setStampStartMs({ id, ms });
  };

  const confirmStamp = (type) => {
    if (!stampStartMs) return;
    if (type === "start") {
      updateSubtitle(stampStartMs.id, "startMs", stampStartMs.ms);
    } else {
      updateSubtitle(stampStartMs.id, "endMs", Math.round(currentTime * 1000));
    }
    setStampStartMs(null);
  };

  const cancelStamp = () => {
    setStampStartMs(null);
  };

  // Real-time lyric mode functions
  const startLyricsMode = () => {
    const lines = lyricsText.trim().split("\n").filter((l) => l.trim());
    setLyricLines(lines);
    setTimestamps(Array(lines.length).fill(null));
    setCurrentLineIdx(0);
    setLyricsMode(true);
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const recordTimestamp = () => {
    if (currentLineIdx >= lyricLines.length) return;

    const ms = Math.round(currentTime * 1000);
    const newTimestamps = [...timestamps];
    newTimestamps[currentLineIdx] = ms;
    setTimestamps(newTimestamps);

    // Move to next line
    if (currentLineIdx < lyricLines.length - 1) {
      setCurrentLineIdx(currentLineIdx + 1);
    } else {
      // All lines done - convert to subtitles
      convertLyricsToSubs(newTimestamps);
      finishLyricsMode();
    }
  };

  const convertLyricsToSubs = (times) => {
    const newSubs = [];
    times.forEach((startMs, idx) => {
      if (startMs === null) return;
      const endMs = times[idx + 1] || startMs + 3000;
      newSubs.push({
        id: Date.now() + idx,
        num: newSubs.length + 1,
        startMs,
        endMs,
        text: lyricLines[idx],
      });
    });
    setSubs((prev) => [...prev, ...newSubs]);
  };

  const finishLyricsMode = () => {
    setLyricsMode(false);
    setLyricsText("");
    setLyricLines([]);
    setTimestamps([]);
    setCurrentLineIdx(0);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipLine = () => {
    const newTimestamps = [...timestamps];
    newTimestamps[currentLineIdx] = null;
    setTimestamps(newTimestamps);
    if (currentLineIdx < lyricLines.length - 1) {
      setCurrentLineIdx(currentLineIdx + 1);
    } else {
      convertLyricsToSubs(newTimestamps);
      finishLyricsMode();
    }
  };

  const undoLastLine = () => {
    if (currentLineIdx > 0) {
      const newTimestamps = [...timestamps];
      newTimestamps[currentLineIdx - 1] = null;
      setTimestamps(newTimestamps);
      setCurrentLineIdx(currentLineIdx - 1);
    }
  };

  // Utilities
  const msToTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.round(ms % 1000);
    return (
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0") +
      "," +
      String(millis).padStart(3, "0")
    );
  };

  const timeToMs = (timeStr) => {
    try {
      const parts = timeStr.split(",");
      const [h, m, s] = parts[0].split(":");
      const ms = parseInt(parts[1]) || 0;
      return (parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s)) * 1000 + ms;
    } catch {
      return 0;
    }
  };

  const exportSrt = () => {
    let srtContent = "";
    const sorted = [...subs].sort((a, b) => a.startMs - b.startMs);
    sorted.forEach((sub, i) => {
      srtContent += `${i + 1}\n${msToTime(sub.startMs)} --> ${msToTime(sub.endMs)}\n${sub.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySrt = () => {
    let srtContent = "";
    const sorted = [...subs].sort((a, b) => a.startMs - b.startMs);
    sorted.forEach((sub, i) => {
      srtContent += `${i + 1}\n${msToTime(sub.startMs)} --> ${msToTime(sub.endMs)}\n${sub.text}\n\n`;
    });
    navigator.clipboard.writeText(srtContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page substamper-page">
      {/* Lyrics Mode Overlay */}
      {lyricsMode && (
        <div className="lyrics-mode-overlay">
          <div className="lyrics-mode-panel">
            <div className="lmp-header">
              <h2>🎵 Lyrics Timing Mode</h2>
              <p>Press <strong>ENTER</strong> when each line starts. Press <strong>SPACE</strong> to pause/play.</p>
            </div>

            {/* Current lyrics display */}
            <div className="lyrics-display">
              {lyricLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`lyrics-line ${idx === currentLineIdx ? "current" : ""} ${
                    timestamps[idx] !== null ? "done" : ""
                  }`}
                >
                  <span className="line-num">{idx + 1}</span>
                  <span className="line-text">{line}</span>
                  {timestamps[idx] !== null && (
                    <span className="line-time">{msToTime(timestamps[idx])}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Playback info */}
            <div className="lyrics-info">
              <span className="info-label">Current Time</span>
              <span className="info-time">{msToTime(currentTime * 1000)}</span>
              <span className="info-progress">
                {currentLineIdx + 1} / {lyricLines.length}
              </span>
            </div>

            {/* Controls */}
            <div className="lyrics-controls">
              <button className="btn-ghost" onClick={undoLastLine} disabled={currentLineIdx === 0}>
                ↶ Undo
              </button>
              <button className="btn-ghost" onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) {
                    audioRef.current.pause();
                  } else {
                    audioRef.current.play();
                  }
                  setIsPlaying(!isPlaying);
                }
              }}>
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
              <button className="btn-ghost" onClick={skipLine}>
                Skip Line →
              </button>
              <button className="btn-primary" onClick={recordTimestamp}>
                ⏎ Stamp & Next
              </button>
              <button className="btn-ghost" onClick={finishLyricsMode} style={{marginLeft: 'auto'}}>
                ✕ Cancel
              </button>
            </div>

            <div className="lyrics-hint">
              ⌨️ Shortcut: Press <strong>ENTER</strong> to stamp instead of clicking the button
            </div>
          </div>
        </div>
      )}

      <div className="ss-header">
        <div className="ss-header-content">
          <h1>SubStamper</h1>
          <p>Precise subtitle timing. Just click and stamp.</p>
        </div>
        <div className="ss-actions">
          <button 
            className={`btn-primary ${lyricsMode ? 'disabled' : ''}`} 
            onClick={lyricsText.trim() ? startLyricsMode : undefined}
            disabled={!lyricsText.trim() || !audioFile || lyricsMode}
          >
            🎤 Lyrics Mode
          </button>
          <button className="btn-ghost" onClick={copySrt} disabled={subs.length === 0}>
            {copied ? "✓ Copied" : "📋 Copy SRT"}
          </button>
          <button className="btn-primary" onClick={exportSrt} disabled={subs.length === 0}>
            ↓ Download SRT
          </button>
        </div>
      </div>

      <div className="ss-main">
        {/* Left: Audio player + Waveform + Lyrics Input */}
        <div className="ss-player">
          <div className="ss-file-input">
            <label htmlFor="audio-input" className="file-label">
              {audioFile ? (
                <>
                  <span className="file-icon">📁</span>
                  <span className="file-name">{audioFile.name}</span>
                </>
              ) : (
                <>
                  <span className="file-icon">🎵</span>
                  <span className="file-text">Click to load audio</span>
                </>
              )}
            </label>
            <input
              id="audio-input"
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              style={{ display: "none" }}
            />
          </div>

          {/* Lyrics input section */}
          <div className="lyrics-input-section">
            <label className="lyrics-label">
              <span className="lyrics-icon">🎤</span> Paste or type lyrics (one per line)
            </label>
            <textarea
              ref={lyricsInputRef}
              className="lyrics-textarea"
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              placeholder="Line 1&#10;Line 2&#10;Line 3&#10;..."
              rows={5}
            />
            {lyricsText.split("\n").filter((l) => l.trim()).length > 0 && (
              <div className="lyrics-count">
                {lyricsText.split("\n").filter((l) => l.trim()).length} lines
              </div>
            )}
          </div>

          {audioFile && (
            <>
              {/* Waveform canvas */}
              <div className="waveform-wrapper">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={140}
                  className="waveform-canvas"
                  onClick={handleCanvasClick}
                />
                <button className="play-overlay" onClick={togglePlayPause}>
                  <span className="play-icon">{isPlaying ? "⏸" : "▶"}</span>
                </button>
              </div>

              {/* Time display */}
              <div className="time-display">
                <span className="time-current">{msToTime(currentTime * 1000)}</span>
                <span className="time-sep">/</span>
                <span className="time-total">{msToTime(duration * 1000)}</span>
              </div>

              {/* Timeline slider */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  setCurrentTime(newTime);
                  if (audioRef.current) {
                    audioRef.current.currentTime = newTime;
                  }
                }}
                className="timeline-slider"
              />

              {/* Controls */}
              <div className="playback-controls">
                <button
                  className="ctrl-btn"
                  onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}
                  title="Go back 1 second"
                >
                  ⏮ -1s
                </button>
                <button className="ctrl-btn play-btn" onClick={togglePlayPause}>
                  {isPlaying ? "⏸ Pause" : "▶ Play"}
                </button>
                <button
                  className="ctrl-btn"
                  onClick={() => setCurrentTime(Math.min(duration, currentTime + 1))}
                  title="Go forward 1 second"
                >
                  +1s ⏭
                </button>
              </div>

              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
            </>
          )}
        </div>

        {/* Right: Subtitles editor */}
        <div className="ss-editor">
          <div className="editor-header">
            <h3 className="editor-title">Subtitles</h3>
            <span className="editor-count">{subs.length}</span>
            <button className="btn-primary btn-sm" onClick={addSubtitle} disabled={!audioFile}>
              + Add
            </button>
          </div>

          <div className="subs-list">
            {subs.length === 0 ? (
              <div className="empty-subs">
                <span className="empty-icon">💬</span>
                <span className="empty-text">{audioFile ? "No subtitles yet. Add one!" : "Load audio first."}</span>
              </div>
            ) : (
              subs
                .sort((a, b) => a.startMs - b.startMs)
                .map((sub, idx) => (
                  <div key={sub.id} className="sub-card">
                    <div className="sub-top">
                      <span className="sub-num">{idx + 1}</span>
                      <button
                        className="delete-btn"
                        onClick={() => deleteSubtitle(sub.id)}
                        title="Delete this subtitle"
                      >
                        🗑
                      </button>
                    </div>

                    <div className="sub-times">
                      <div className="time-field">
                        <label className="time-label">Start</label>
                        <div className="time-input-group">
                          <input
                            type="text"
                            value={msToTime(sub.startMs)}
                            onChange={(e) => {
                              const ms = timeToMs(e.target.value);
                              updateSubtitle(sub.id, "startMs", ms);
                            }}
                            className="time-input"
                          />
                          <button
                            className="stamp-btn"
                            onClick={() => stampTime(sub.id)}
                            title="Stamp current playback time as start"
                          >
                            📍
                          </button>
                        </div>
                      </div>

                      {stampStartMs?.id === sub.id && (
                        <div className="stamp-confirm">
                          <span className="stamp-val">{msToTime(stampStartMs.ms)}</span>
                          <button
                            className="btn-tiny btn-confirm"
                            onClick={() => confirmStamp("start")}
                            title="Confirm start time"
                          >
                            ✓
                          </button>
                          <button
                            className="btn-tiny btn-cancel"
                            onClick={cancelStamp}
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <div className="time-sep">→</div>

                      <div className="time-field">
                        <label className="time-label">End</label>
                        <div className="time-input-group">
                          <input
                            type="text"
                            value={msToTime(sub.endMs)}
                            onChange={(e) => {
                              const ms = timeToMs(e.target.value);
                              updateSubtitle(sub.id, "endMs", ms);
                            }}
                            className="time-input"
                          />
                          <button
                            className="stamp-btn"
                            onClick={() => {
                              updateSubtitle(sub.id, "endMs", Math.round(currentTime * 1000));
                              setStampStartMs(null);
                            }}
                            title="Stamp current playback time as end"
                          >
                            📍
                          </button>
                        </div>
                      </div>
                    </div>

                    <textarea
                      value={sub.text}
                      onChange={(e) => updateSubtitle(sub.id, "text", e.target.value)}
                      className="sub-text"
                      placeholder="Enter subtitle text..."
                      rows={2}
                    />
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}