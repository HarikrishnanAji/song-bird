import { useRef, useState } from "react";
import "./DropZone.css";

export default function DropZone({ accept, label, subLabel, icon, file, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {file ? (
        <div className="dz-file-info">
          <span className="dz-file-icon">{icon}</span>
          <div>
            <div className="dz-file-name">{file.name}</div>
            <div className="dz-file-size">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <button
            className="dz-clear"
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
          >✕</button>
        </div>
      ) : (
        <>
          <div className="dz-icon">{icon}</div>
          <div className="dz-label">{label}</div>
          <div className="dz-sub">{subLabel}</div>
          <div className="dz-btn">Browse files</div>
        </>
      )}

      <div className="dz-corners">
        <span /><span /><span /><span />
      </div>
    </div>
  );
}
