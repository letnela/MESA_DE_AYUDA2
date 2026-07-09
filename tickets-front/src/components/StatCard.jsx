export default function StatCard({ icon, title, value, tone }) {
  return (
    <div className={`stat-card ${tone || ""}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}