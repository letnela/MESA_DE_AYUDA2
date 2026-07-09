export default function PanelCard({ title, icon, children, action }) {
  return (
    <section className="panel-card">
      <div className="panel-header">
        <h3>
          {icon} {title}
        </h3>

        {action && <button>{action}</button>}
      </div>

      <div className="panel-body">
        {children}
      </div>
    </section>
  );
}