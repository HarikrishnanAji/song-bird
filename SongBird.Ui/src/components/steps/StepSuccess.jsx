import "./Steps.css";

export default function StepSuccess({ videoMeta, onNew, onLibrary }) {
  return (
    <div className="success-panel">
      <div className="success-rings">
        <div className="sr sr-1" />
        <div className="sr sr-2" />
        <div className="sr sr-3" />
        <div className="success-core">🎬</div>
      </div>

      <div className="success-title">VIDEO RENDERED!</div>
      <div className="success-sub">
        <strong>{videoMeta.title}</strong> by <strong>{videoMeta.artist}</strong> is ready.
      </div>

      <div className="success-meta">
        <div className="sm-item">
          <span className="sm-icon">✅</span>
          <span>Audio processed</span>
        </div>
        <div className="sm-item">
          <span className="sm-icon">♪</span>
          <span>Lyrics synced</span>
        </div>
        <div className="sm-item">
          <span className="sm-icon">🎬</span>
          <span>Video rendered</span>
        </div>
      </div>

      <div className="success-actions">
        <button className="btn-primary" onClick={onLibrary}>
          📁 View in Library
        </button>
        <button className="btn-ghost" onClick={onNew}>
          + Create Another
        </button>
      </div>

      {/* Confetti-like bars */}
      <div className="success-bars">
        {Array(20).fill(0).map((_, i) => (
          <span
            key={i}
            className="sb"
            style={{
              left: `${i * 5 + 2}%`,
              animationDelay: `${(i * 0.08).toFixed(2)}s`,
              animationDuration: `${0.5 + (i % 5) * 0.2}s`,
              height: `${20 + (i % 7) * 15}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
