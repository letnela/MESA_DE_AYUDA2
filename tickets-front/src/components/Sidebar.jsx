import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Tags,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ListChecks,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function Sidebar({ usuario }) {
  const [open, setOpen] = useState(false);

  const rol = (
    usuario?.rol ||
    localStorage.getItem("rol") ||
    ""
  ).toUpperCase();

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Vistas de navegación con semántica corporativa
  const menuAdmin = [
    {
      to: "/dashboard",
      label: "Consola Principal",
      icon: <LayoutDashboard size={17} />,
    },
    {
      to: "/tickets",
      label: "Gestión de Tickets",
      icon: <Ticket size={17} />,
    },
    {
      to: "/usuarios",
      label: "Control de Usuarios",
      icon: <Users size={17} />,
    },
    {
      to: "/categorias",
      label: "Categorías",
      icon: <Tags size={17} />,
    },
   
    {
      to: "/perfil",
      label: "Mi Perfil",
      icon: <User size={17} />,
    },
  ];

  const menuUsuario = [
    {
      to: "/usuario/dashboard",
      label: "Inicio",
      icon: <LayoutDashboard size={17} />,
    },
    {
      to: "/usuario/crear-ticket",
      label: "Aperturar Incidencia",
      icon: <PlusCircle size={17} />,
    },
    {
      to: "/usuario/mis-tickets",
      label: "Mis Requerimientos",
      icon: <ListChecks size={17} />,
    },
    {
      to: "/perfil",
      label: "Mi Perfil",
      icon: <User size={17} />,
    },
  ];

  const menuTecnico = [
    {
      to: "/tecnico/dashboard",
      label: "Panel Técnico",
      icon: <LayoutDashboard size={17} />,
    },
    {
      to: "/tecnico/tickets",
      label: "Casos Asignados",
      icon: <Ticket size={17} />,
    },
    {
      to: "/tecnico/reportes",
      label: "Rendimiento Operativo",
      icon: <BarChart3 size={17} />,
    },
    {
      to: "/perfil",
      label: "Mi Perfil",
      icon: <User size={17} />,
    },
  ];

  const menu =
    rol === "USUARIO"
      ? menuUsuario
      : rol === "TECNICO"
      ? menuTecnico
      : menuAdmin;

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <button
          className="sidebar-close"
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </button>

        {/* Brand Header Limpio con la identidad de Cibertec */}
        <div className="brand">
          <div className="brand-icon" style={{ backgroundColor: "#1e40af" }}>CIB</div>
          <div>
            <h2>Tickets Cibertec</h2>
            <span>{rol || "SISTEMA"}</span>
          </div>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="menu">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sección de Usuario Estilizada en el Footer */}
        <div className="sidebar-footer">
          <div className="user-box">
            <div className="avatar">
              {usuario?.nombreCompleto?.charAt(0) || "U"}
            </div>

            <div>
              <strong>{usuario?.nombreCompleto || "Usuario Activo"}</strong>
              <small>{usuario?.email || "operador@cibertec.edu.pe"}</small>
            </div>
          </div>

          <button onClick={logout} className="logout-btn">
            <LogOut size={14} />
            Terminar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}