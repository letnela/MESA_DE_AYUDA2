import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import "../css/usuario-dashboard.css";

export default function UsuarioDashboard() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = localStorage.getItem("usuarioId");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("TODOS");

  const cargarTickets = async () => {
    try {
      if (!usuarioId) {
        setTickets([]);
        return;
      }

      const { data } = await api.get(`/api/tickets/usuario/${usuarioId}`);
      const lista = Array.isArray(data) ? data : data.content || [];

      setTickets(lista.filter((t) => t.usuario?.id === usuarioId));
    } catch (error) {
      console.error("Error cargando tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  // KPIs globales
  const total = tickets.length;
  const abiertos = tickets.filter(t => t.estado === "ABIERTO" || t.estado === "PENDIENTE").length;
  const proceso = tickets.filter(t => t.estado === "ASIGNADO" || t.estado === "EN_PROCESO").length;
  const resueltos = tickets.filter(t => t.estado === "RESUELTO" || t.estado === "CERRADO").length;

  // Lógica de filtrado por Tab
  const ticketsFiltrados = tickets.filter((t) => {
    if (activeTab === "ACTIVOS") {
      return t.estado === "ABIERTO" || t.estado === "PENDIENTE" || t.estado === "ASIGNADO" || t.estado === "EN_PROCESO";
    }
    if (activeTab === "FINALIZADOS") {
      return t.estado === "RESUELTO" || t.estado === "CERRADO";
    }
    return true; 
  });

  const recientes = ticketsFiltrados.slice(0, 6);

  const getEstadoClass = (estado) => {
    if (!estado) return "status-abierto";
    const est = estado.toUpperCase();
    if (est === "ABIERTO" || est === "PENDIENTE") return "status-abierto";
    if (est === "ASIGNADO" || est === "EN_PROCESO") return "status-proceso";
    if (est === "RESUELTO" || est === "CERRADO") return "status-resuelto";
    return "";
  };

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <main className="dashboard-main">
        {/* Topbar Ejecutiva */}
        <div className="dashboard-topbar">
          <div>
            <span className="dashboard-breadcrumb">Mesa de Servicios / Consola Operativa</span>
            <h2>Centro de Mandos Técnico</h2>
          </div>

          <div className="dashboard-topbar-user">
            <div className="avatar-corp">
              {usuario.nombreCompleto?.charAt(0) || "U"}
            </div>
            <div>
              <strong>{usuario.nombreCompleto || "Cliente"}</strong>
              <small>{usuario.email}</small>
            </div>
          </div>
        </div>

        <section className="dashboard-container">
          
          {/* Fila de Indicadores KPI */}
          <div className="dashboard-stats-grid">
            <div className="stat-card-corp">
              <div className="stat-icon-wrapper"><Ticket size={18} /></div>
              <div className="stat-data-corp"><span>Volumen Total</span><h2>{total}</h2></div>
            </div>

            <div className="stat-card-corp">
              <div className="stat-icon-wrapper warning"><AlertCircle size={18} /></div>
              <div className="stat-data-corp"><span>Por Atender</span><h2>{abiertos}</h2></div>
            </div>

            <div className="stat-card-corp">
              <div className="stat-icon-wrapper process"><Clock size={18} /></div>
              <div className="stat-data-corp"><span>En Diagnóstico</span><h2>{proceso}</h2></div>
            </div>

            <div className="stat-card-corp">
              <div className="stat-icon-wrapper success"><CheckCircle size={18} /></div>
              <div className="stat-data-corp"><span>Cierres SLA</span><h2>{resueltos}</h2></div>
            </div>
          </div>

          {/* Panel Principal a Pantalla Completa */}
          <div className="card-panel-corp">
            <div className="panel-header-wrapper">
              <div className="panel-header-corp">
                <h3>Monitoreo de Solicitudes Recientes</h3>
                <p>Estado operacional en tiempo real de sus requerimientos.</p>
              </div>

              {/* Controles de Filtrado e Incidencia reunidos en la misma línea */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div className="panel-tabs">
                  <button 
                    className={`tab-btn ${activeTab === "TODOS" ? "active" : ""}`} 
                    onClick={() => setActiveTab("TODOS")}
                  >
                    Todos
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === "ACTIVOS" ? "active" : ""}`} 
                    onClick={() => setActiveTab("ACTIVOS")}
                  >
                    Activos ({abiertos + proceso})
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === "FINALIZADOS" ? "active" : ""}`} 
                    onClick={() => setActiveTab("FINALIZADOS")}
                  >
                    Finalizados
                  </button>
                </div>

                <Link className="btn-primary-corp" to="/usuario/crear-ticket">
                  <PlusCircle size={15} />
                  Aperturar Incidencia
                </Link>
              </div>
            </div>

            {loading ? (
              <p style={{ fontSize: "13px", color: "#64748b", padding: "16px 0" }}>Consultando registros de auditoría...</p>
            ) : recientes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                <p style={{ fontSize: "13px", margin: 0 }}>No se localizan incidencias en este segmento.</p>
              </div>
            ) : (
              <table className="corp-ticket-table-mini">
                <thead>
                  <tr>
                    <th>Detalles del Requerimiento</th>
                    <th>Estado de Caso</th>
                    <th>Prioridad Asignada</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <div className="ticket-meta-title">{ticket.titulo || "Sin título"}</div>
                        <div className="ticket-meta-sub">{ticket.codigo || `TK-${ticket.id}`}</div>
                      </td>
                      <td>
                        <span className={`badge-state-corp ${getEstadoClass(ticket.estado)}`}>
                          {ticket.estado || "ABIERTO"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: "500", color: "#475569" }}>
                          {ticket.prioridad || "MEDIA"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link to="/usuario/mis-tickets" className="panel-link-inline">
                Ver historial de auditoría completo
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}