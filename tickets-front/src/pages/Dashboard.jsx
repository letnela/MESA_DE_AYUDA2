import { useEffect, useState } from "react";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Tags,
  Users,
  FolderKanban,
  RefreshCw,
} from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./css/dashboard-admin.css";

export default function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [dashboard, setDashboard] = useState({
    totalTickets: 0,
    abiertos: 0,
    asignados: 0,
    enProceso: 0,
    resueltos: 0,
    cerrados: 0,
  });

  const [tickets, setTickets] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [dashboardRes, ticketsRes, usuariosRes, categoriasRes] =
        await Promise.all([
          api.get("/api/dashboard"),
          api.get("/api/tickets"),
          api.get("/usuarios"),
          api.get("/api/categorias"),
        ]);

      setDashboard(dashboardRes.data || {});
      setTickets(ticketsRes.data || []);
      setUsuarios(usuariosRes.data || []);
      setCategorias(categoriasRes.data || []);
    } catch (error) {
      console.error("Error cargando dashboard", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const ticketsRecientes = [...tickets]
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    .slice(0, 5);

  const categoriasConConteo = categorias
    .map((categoria) => ({
      ...categoria,
      total: tickets.filter((t) => t.categoria?.id === categoria.id).length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const tecnicosConConteo = usuarios
    .filter((u) => u.rol?.nombre === "TECNICO" || u.rol === "TECNICO")
    .map((tecnico) => ({
      ...tecnico,
      total: tickets.filter((t) => t.tecnico?.id === tecnico.id).length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const getEstadoClass = (estado) => {
    if (!estado) return "pendiente";

    const e = estado.toLowerCase();

    if (e.includes("asig") || e.includes("proceso")) return "proceso";
    if (e.includes("resuel") || e.includes("cerr")) return "resuelto";

    return "pendiente";
  };

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <div className="main-area">
        <Topbar usuario={usuario} />

        <main className="dashboard-admin-main">
          <div className="dashboard-admin-topbar">
            <div>
              <span className="dashboard-admin-breadcrumb">
                Administración / Dashboard
              </span>
              <h2>Panel General</h2>
            </div>

            <div className="dashboard-admin-user">
              <span>Usuario administrador</span>
              <strong>{usuario.nombreCompleto || usuario.email}</strong>
            </div>
          </div>

          <section className="dashboard-admin-page">
            <div className="dashboard-admin-hero">
              <div>
                <span className="dashboard-admin-label">Resumen operativo</span>
                <h1>Buenos días, {usuario.nombreCompleto || usuario.email} 👋</h1>
                <p>
                  Consulte el estado general de tickets, solicitudes recientes,
                  categorías con mayor actividad y carga de trabajo por técnico.
                </p>
              </div>

              <button
                type="button"
                className="dashboard-admin-btn-secondary"
                onClick={cargarDatos}
                disabled={cargando}
              >
                <RefreshCw size={16} />
                {cargando ? "Actualizando..." : "Actualizar"}
              </button>
            </div>

            <div className="dashboard-admin-stats-grid">
              <div className="dashboard-admin-stat-card">
                <div className="dashboard-admin-stat-icon blue">
                  <Ticket size={24} />
                </div>
                <div>
                  <span>Total Tickets</span>
                  <strong>{dashboard.totalTickets || 0}</strong>
                </div>
              </div>

              <div className="dashboard-admin-stat-card">
                <div className="dashboard-admin-stat-icon orange">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <span>Abiertos</span>
                  <strong>{dashboard.abiertos || 0}</strong>
                </div>
              </div>

              <div className="dashboard-admin-stat-card">
                <div className="dashboard-admin-stat-icon cyan">
                  <Clock size={24} />
                </div>
                <div>
                  <span>En Proceso</span>
                  <strong>{dashboard.enProceso || 0}</strong>
                </div>
              </div>

              <div className="dashboard-admin-stat-card">
                <div className="dashboard-admin-stat-icon green">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <span>Resueltos</span>
                  <strong>{dashboard.resueltos || 0}</strong>
                </div>
              </div>
            </div>

            <div className="dashboard-admin-panels-grid">
              <div className="dashboard-admin-panel">
                <div className="dashboard-admin-panel-header">
                  <div>
                    <span>Actividad reciente</span>
                    <h3>Tickets recientes</h3>
                  </div>
                  <Ticket size={20} />
                </div>

                {ticketsRecientes.length === 0 ? (
                  <p className="dashboard-admin-empty">
                    No hay tickets registrados.
                  </p>
                ) : (
                  <div className="dashboard-admin-list">
                    {ticketsRecientes.map((ticket) => (
                      <div className="dashboard-admin-list-row" key={ticket.id}>
                        <div>
                          <strong>{ticket.titulo || "Sin título"}</strong>
                          <span>{ticket.codigo || "Sin código"}</span>
                        </div>

                        <b className={`dashboard-admin-badge ${getEstadoClass(ticket.estado)}`}>
                          {ticket.estado || "ABIERTO"}
                        </b>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dashboard-admin-panel">
                <div className="dashboard-admin-panel-header">
                  <div>
                    <span>Clasificación</span>
                    <h3>Categorías más usadas</h3>
                  </div>
                  <FolderKanban size={20} />
                </div>

                {categoriasConConteo.length === 0 ? (
                  <p className="dashboard-admin-empty">
                    No hay categorías registradas.
                  </p>
                ) : (
                  <div className="dashboard-admin-list">
                    {categoriasConConteo.map((categoria) => (
                      <div className="dashboard-admin-list-row" key={categoria.id}>
                        <div>
                          <strong>{categoria.nombre}</strong>
                          <span>Categoría de soporte</span>
                        </div>

                        <b className="dashboard-admin-badge neutral">
                          {categoria.total} tickets
                        </b>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dashboard-admin-panel">
                <div className="dashboard-admin-panel-header">
                  <div>
                    <span>Equipo técnico</span>
                    <h3>Técnicos con más tickets</h3>
                  </div>
                  <Users size={20} />
                </div>

                {tecnicosConConteo.length === 0 ? (
                  <p className="dashboard-admin-empty">
                    No hay técnicos con tickets.
                  </p>
                ) : (
                  <div className="dashboard-admin-list">
                    {tecnicosConConteo.map((tecnico) => (
                      <div className="dashboard-admin-list-row" key={tecnico.id}>
                        <div>
                          <strong>{tecnico.nombreCompleto}</strong>
                          <span>{tecnico.email || "Técnico"}</span>
                        </div>

                        <b className="dashboard-admin-badge neutral">
                          {tecnico.total} tickets
                        </b>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-admin-section-title">
              <Tags size={18} />
              <span>Estado general de tickets</span>
            </div>

            <div className="dashboard-admin-mini-grid">
              <div className="dashboard-admin-mini-card">
                <span>Abiertos</span>
                <strong>{dashboard.abiertos || 0}</strong>
              </div>

              <div className="dashboard-admin-mini-card">
                <span>Asignados</span>
                <strong>{dashboard.asignados || 0}</strong>
              </div>

              <div className="dashboard-admin-mini-card">
                <span>En Proceso</span>
                <strong>{dashboard.enProceso || 0}</strong>
              </div>

              <div className="dashboard-admin-mini-card">
                <span>Cerrados</span>
                <strong>{dashboard.cerrados || 0}</strong>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
