import "./StatCard.css";

export default function StatCard({ label, value, icon, delta }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-value">{value}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-delta">{delta}</div>
      <div className="stat-glow" />
    </div>
  );
}
