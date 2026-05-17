import "./StepIndicator.css";

export default function StepIndicator({ steps, current }) {
  return (
    <div className="step-indicator">
      {steps.map((s, i) => {
        const state = s.num < current ? "done" : s.num === current ? "active" : "idle";
        return (
          <div key={s.num} className="step-item">
            <div className={`step-bubble ${state}`}>
              {state === "done" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{s.icon}</span>
              )}
              {state === "active" && <div className="step-ripple" />}
            </div>
            <div className="step-info">
              <div className="step-n">Step {s.num}</div>
              <div className="step-lbl">{s.label}</div>
            </div>
            {i < steps.length - 1 && (
              <div className={`step-connector ${s.num < current ? "done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
