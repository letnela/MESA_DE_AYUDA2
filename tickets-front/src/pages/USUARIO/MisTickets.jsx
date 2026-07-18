import { useEffect, useState } from "react";
import { Bot, Paperclip, Download, Eye } from "lucide-react";

import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import "../css/mis-tickets.css";

export default function MisTickets() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = localStorage.getItem("usuarioId");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarTickets = async () => {
    try {
      if (!usuarioId) {
        setTickets([]);
        return;
      }

      const { data } = await api.get(`/api/tickets/usuario/${usuarioId}`);
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando mis tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const getEstadoClass = (estado) => {
    if (!estado) return "estado-pendiente";
    const est = estado.toLowerCase();

    if (est.includes("progre") || est.includes("asig")) return "estado-progreso";
    if (est.includes("resuel") || est.includes("final") || est.includes("cerr")) {
      return "estado-resuelto";
    }

    return "estado-pendiente";
  };

  const getPrioridadClass = (prioridad) => {
    if (!prioridad) return "baja";
    const p = prioridad.toLowerCase();

    if (p.includes("alt")) return "alta";
    if (p.includes("med")) return "media";

    return "baja";
  };

  const obtenerNombreAdjunto = (adjunto) => {
    return (
      adjunto?.nombreOriginal ||
      adjunto?.nombreArchivo ||
      adjunto?.archivo ||
      "Archivo adjunto"
    );
  };

  const obtenerUrlAdjunto = (adjunto) => {
    if (!adjunto) return "#";

    if (adjunto.url) return adjunto.url;
    if (adjunto.ruta) {
      const rutaNormalizada = String(adjunto.ruta).replaceAll("\\", "/");
      if (rutaNormalizada.startsWith("http")) return rutaNormalizada;
      return `${api.defaults.baseURL || ""}/${rutaNormalizada}`;
    }

    if (adjunto.nombreArchivo) {
      return `${api.defaults.baseURL || ""}/uploads/tickets/${adjunto.nombreArchivo}`;
    }

    return "#";
  };

  const abrirAdjunto = (adjunto) => {
    const url = obtenerUrlAdjunto(adjunto);

    if (!url || url === "#") {
      alert("No se encontró la ruta del archivo.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <main className="mis-tickets-main">
        <div className="mis-tickets-topbar">
          <div>
            <span className="mis-tickets-breadcrumb">
              Panel / Solicitudes / Historial
            </span>
            <h2>Mis Tickets</h2>
          </div>

          <div className="mis-tickets-user">
            <span>Usuario del sistema</span>
            <strong>{usuario.email}</strong>
          </div>
        </div>

        <section className="mis-tickets-container">
          <div className="mis-tickets-hero">
            <span className="mis-tickets-hero-label">Registro General</span>
            <h1>Historial de Solicitudes</h1>
            <p>
              Consulte el estado actual, las áreas asignadas, los adjuntos
              enviados y el dictamen automatizado provisto por el motor de
              inteligencia artificial.
            </p>
          </div>

          <div className="mis-tickets-card">
            {loading ? (
              <p className="mis-tickets-empty">
                Cargando registros de auditoría...
              </p>
            ) : tickets.length === 0 ? (
              <p className="mis-tickets-empty">
                No se encontraron tickets registrados para su cuenta.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>ID / Código</th>
                      <th>Detalles de la Incidencia</th>
                      <th>Adjuntos</th>
                      <th>Análisis de IA</th>
                      <th>Área Asignada</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Fecha Registro</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="code-txt">
                          {ticket.codigo || `#${ticket.id}`}
                        </td>

                        <td className="ticket-info-cell">
                          <strong>
                            {ticket.titulo || "Sin título especificado"}
                          </strong>
                          <p title={ticket.descripcion}>
                            {ticket.descripcion || "-"}
                          </p>
                        </td>

                        <td>
                          {ticket.adjuntos && ticket.adjuntos.length > 0 ? (
                            <div className="adjuntos-cell">
                              <div className="adjuntos-summary">
                                <Paperclip size={14} />
                                <strong>{ticket.adjuntos.length}</strong>
                                <span>archivo(s)</span>
                              </div>

                              <div className="adjuntos-list">
                                {ticket.adjuntos.map((adjunto, index) => (
                                  <div
                                    className="adjunto-item"
                                    key={adjunto.id || index}
                                  >
                                    <span title={obtenerNombreAdjunto(adjunto)}>
                                      {obtenerNombreAdjunto(adjunto)}
                                    </span>

                                    <button
                                      type="button"
                                      title="Ver archivo"
                                      onClick={() => abrirAdjunto(adjunto)}
                                    >
                                      <Eye size={13} />
                                    </button>

                                    <a
                                      href={obtenerUrlAdjunto(adjunto)}
                                      target="_blank"
                                      rel="noreferrer"
                                      title="Descargar archivo"
                                    >
                                      <Download size={13} />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="badge-corp manual">
                              Sin adjuntos
                            </span>
                          )}
                        </td>

                        <td>
                          {ticket.analizadoPorIa ? (
                            <div className="ia-cell">
                              <span className="ia-tag">
                                <Bot size={14} />
                                {ticket.tipoSolicitud || "Clasificado"}
                              </span>
                              <small title={ticket.respuestaIa}>
                                {ticket.respuestaIa ||
                                  "Sin observaciones adicionales"}
                              </small>
                            </div>
                          ) : (
                            <span className="badge-corp manual">
                              Asignación Manual
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="badge-corp area">
                            {ticket.areaDestino || "Por determinar"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge-corp ${getEstadoClass(
                              ticket.estado
                            )}`}
                          >
                            {ticket.estado || "Abierto"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge-corp priority-${getPrioridadClass(
                              ticket.prioridad
                            )}`}
                          >
                            {ticket.prioridad || "Baja"}
                          </span>
                        </td>

                        <td style={{ whiteSpace: "nowrap", color: "#64748b" }}>
                          {ticket.fechaCreacion
                            ? new Date(ticket.fechaCreacion).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
