import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Search, RefreshCw } from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function TecnicoDashboard({ mode = "dashboard" }) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}") || {};
  const usuarioId = localStorage.getItem("usuarioId") || usuario.id;

  const [tickets, setTickets] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [solucion, setSolucion] = useState({});

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [ticketsRes, historialRes] = await Promise.all([
        api.get(`/api/tickets/tecnico/${usuarioId}`),
        api.get(`/api/tickets`),
      ]);

      setTickets(ticketsRes.data || []);
      setHistorial((historialRes.data || []).filter((t) => t.estado === "RESUELTO" || t.estado === "CERRADO"));
    } catch (error) {
      console.error("Error cargando datos del técnico", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuarioId) {
      cargarDatos();
    }
  }, [usuarioId]);

  const ticketsFiltrados = useMemo(() => {
    const query = busqueda.toLowerCase();
    return tickets.filter((ticket) =>
      `${ticket.titulo || ""} ${ticket.descripcion || ""} ${ticket.estado || ""} ${ticket.usuario?.nombreCompleto || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [tickets, busqueda]);

  const historialFiltrado = useMemo(() => {
    const query = busqueda.toLowerCase();
    return historial.filter((ticket) =>
      `${ticket.titulo || ""} ${ticket.descripcion || ""} ${ticket.observacionResolucion || ""} ${ticket.usuario?.nombreCompleto || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [historial, busqueda]);

  const actualizarEstado = async (ticketId, nuevoEstado) => {
    if (!usuarioId) return;

    try {
      await api.put("/api/tickets/estado", {
        ticketId,
        nuevoEstado,
        usuarioAccionId: usuarioId,
        observacionResolucion: solucion[ticketId] || "",
      });
      setSolucion((prev) => ({ ...prev, [ticketId]: "" }));
      cargarDatos();
    } catch (error) {
      console.error("Error actualizando estado", error);
      alert("No se pudo actualizar el ticket");
    }
  };

  const mostrarVista = mode === "reportes" ? "reportes" : mode === "tickets" ? "tickets" : "dashboard";

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />
      <div className="main-area">
        <Topbar usuario={usuario} />
        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Panel técnico</h1>
              <p className="subtitle">Gestiona tus tickets asignados, desarrolla la solución y registra el cierre.</p>
            </div>
            <button className="secondary-btn" onClick={cargarDatos}>
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card purple">
              <div className="stat-icon"><ClipboardList size={24} /></div>
              <div>
                <p>Asignados</p>
                <strong>{tickets.filter((t) => t.estado !== "RESUELTO" && t.estado !== "CERRADO").length}</strong>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon"><CheckCircle2 size={24} /></div>
              <div>
                <p>Atendidos</p>
                <strong>{historial.length}</strong>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-toolbar">
              <div className="search-box">
                <Search size={16} />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar tickets o soluciones..."
                />
              </div>
            </div>

            {mostrarVista === "dashboard" && (
              <div className="panel-body">
                <p className="subtitle">Vista rápida de tus tickets asignados.</p>
                {cargando ? (
                  <p className="empty-text">Cargando...</p>
                ) : ticketsFiltrados.length === 0 ? (
                  <p className="empty-text">No tienes tickets asignados.</p>
                ) : (
                  ticketsFiltrados.map((ticket) => (
                    <div className="list-row" key={ticket.id}>
                      <span>{ticket.titulo}</span>
                      <b>{ticket.estado}</b>
                    </div>
                  ))
                )}
              </div>
            )}

            {mostrarVista === "tickets" && (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Solicitante</th>
                      <th>Estado</th>
                      <th>Solución</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargando ? (
                      <tr><td colSpan="5" className="empty-table">Cargando...</td></tr>
                    ) : ticketsFiltrados.length === 0 ? (
                      <tr><td colSpan="5" className="empty-table">No tienes tickets asignados.</td></tr>
                    ) : ticketsFiltrados.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <strong>{ticket.titulo}</strong>
                          <small className="table-subtext">{ticket.descripcion}</small>
                        </td>
                        <td>{ticket.usuario?.nombreCompleto || "-"}</td>
                        <td>
                          <span className={`badge state-${ticket.estado || "ABIERTO"}`}>{ticket.estado}</span>
                        </td>
                        <td>
                          <textarea
                            rows="2"
                            value={solucion[ticket.id] || ""}
                            onChange={(e) => setSolucion((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                            placeholder="Describe la solución aplicada"
                          />
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="primary-btn" onClick={() => actualizarEstado(ticket.id, "EN_PROCESO")}>
                              En proceso
                            </button>
                            <button className="primary-btn" onClick={() => actualizarEstado(ticket.id, "RESUELTO")}>
                              Resolver
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {mostrarVista === "reportes" && (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Estado</th>
                      <th>Solución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargando ? (
                      <tr><td colSpan="3" className="empty-table">Cargando...</td></tr>
                    ) : historialFiltrado.length === 0 ? (
                      <tr><td colSpan="3" className="empty-table">Aún no hay tickets desarrollados.</td></tr>
                    ) : historialFiltrado.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <strong>{ticket.titulo}</strong>
                          <small className="table-subtext">{ticket.descripcion}</small>
                        </td>
                        <td>
                          <span className={`badge state-${ticket.estado || "RESUELTO"}`}>{ticket.estado}</span>
                        </td>
                        <td>{ticket.observacionResolucion || "Sin solución registrada"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
