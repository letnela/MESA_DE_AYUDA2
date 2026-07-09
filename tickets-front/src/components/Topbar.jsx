import { LogOut } from "lucide-react";

export default function Topbar({ usuario }) {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="topbar">
      <h3>Sistema de Gestión de Tickets</h3>

      <div className="top-user">
        <div className="avatar small">AD</div>
        <strong>{usuario?.email || "admin@gmail.com"}</strong>

        <button onClick={logout}>
          <LogOut size={15} /> Salir
        </button>
      </div>
    </header>
  );
}