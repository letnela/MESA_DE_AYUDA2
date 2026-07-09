import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Bot,
  Eye,
  FileText,
  Printer,
  Paperclip,
  Download,
  ClipboardList,
} from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./css/tickets-admin.css";

export default function Tickets() {
  const usuarioStorage = localStorage.getItem("usuario");

  const usuario =
    usuarioStorage && usuarioStorage !== "undefined"
      ? JSON.parse(usuarioStorage)
      : null;

  const usuarioAccionId = localStorage.getItem("usuarioId") || usuario?.id;

  const [tickets, setTickets] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modo, setModo] = useState("ver");
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "MEDIA",
    categoriaId: "",
    fechaLimite: "",
    tiempoEstimadoHoras: "",
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [ticketsRes, categoriasRes, usuariosRes] = await Promise.all([
        api.get("/api/tickets"),
        api.get("/api/categorias"),
        api.get("/usuarios"),
      ]);

      setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      setCategorias(Array.isArray(categoriasRes.data) ? categoriasRes.data : []);
      setUsuarios(Array.isArray(usuariosRes.data) ? usuariosRes.data : []);
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const tecnicos = usuarios.filter(
    (u) => u.rol?.nombre === "TECNICO" || u.rol === "TECNICO"
  );

  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((ticket) =>
      `
        ${ticket.codigo || ""}
        ${ticket.titulo || ""}
        ${ticket.descripcion || ""}
        ${ticket.estado || ""}
        ${ticket.prioridad || ""}
        ${ticket.tipoSolicitud || ""}
        ${ticket.areaDestino || ""}
        ${ticket.respuestaIa || ""}
        ${ticket.categoria?.nombre || ""}
        ${ticket.usuario?.nombreCompleto || ""}
        ${ticket.usuario?.email || ""}
        ${ticket.tecnico?.nombreCompleto || ""}
      `
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [tickets, busqueda]);

  const abrirCrear = () => {
    setModo("crear");
    setTicketSeleccionado(null);
    setForm({
      titulo: "",
      descripcion: "",
      prioridad: "MEDIA",
      categoriaId: "",
      fechaLimite: "",
      tiempoEstimadoHoras: "",
    });
    setDrawerOpen(true);
  };

  const abrirVer = (ticket) => {
    setModo("ver");
    setTicketSeleccionado(ticket);
    setDrawerOpen(true);
  };

  const abrirEditar = (ticket) => {
    setModo("editar");
    setTicketSeleccionado(ticket);

    setForm({
      titulo: ticket.titulo || "",
      descripcion: ticket.descripcion || "",
      prioridad: ticket.prioridad || "MEDIA",
      categoriaId: ticket.categoria?.id || "",
      fechaLimite: ticket.fechaLimite ? ticket.fechaLimite.substring(0, 10) : "",
      tiempoEstimadoHoras: ticket.tiempoEstimadoHoras || "",
    });

    setDrawerOpen(true);
  };

  const cerrarDrawer = () => {
    setDrawerOpen(false);
    setTicketSeleccionado(null);
  };

  const guardarTicket = async (e) => {
    e.preventDefault();

    if (!usuarioAccionId) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    if (!form.titulo.trim()) {
      alert("Ingrese el título");
      return;
    }

    if (!form.descripcion.trim()) {
      alert("Ingrese la descripción");
      return;
    }

    if (!form.categoriaId) {
      alert("Seleccione una categoría");
      return;
    }

    const payload = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      prioridad: form.prioridad,
      categoriaId: form.categoriaId,
      fechaLimite: form.fechaLimite ? `${form.fechaLimite}T23:59:00` : null,
      tiempoEstimadoHoras: form.tiempoEstimadoHoras
        ? Number(form.tiempoEstimadoHoras)
        : null,
    };

    try {
      if (modo === "crear") {
        await api.post(`/api/tickets?usuarioId=${usuarioAccionId}`, payload);
        alert("Ticket creado correctamente");
      } else {
        await api.put(
          `/api/tickets/${ticketSeleccionado.id}?usuarioAccionId=${usuarioAccionId}`,
          payload
        );
        alert("Ticket editado correctamente");
      }

      cerrarDrawer();
      cargarDatos();
    } catch (error) {
      console.error("Error guardando ticket", error);
      alert("Error guardando ticket");
    }
  };

  const eliminarTicket = async (ticket) => {
    const confirmar = confirm(`¿Eliminar el ticket "${ticket.titulo}"?`);
    if (!confirmar) return;

    try {
      await api.delete(
        `/api/tickets/${ticket.id}?usuarioAccionId=${usuarioAccionId}`
      );

      alert("Ticket eliminado correctamente");
      cargarDatos();
    } catch (error) {
      console.error("Error eliminando ticket", error);
      alert("No se pudo eliminar el ticket");
    }
  };

  const asignarTecnico = async (ticketId, tecnicoId) => {
    if (!tecnicoId || !usuarioAccionId) return;

    try {
      await api.put("/api/tickets/asignar", {
        ticketId,
        tecnicoId,
        usuarioAccionId,
      });

      await cargarDatos();
    } catch (error) {
      console.error("Error asignando técnico", error);
      alert("No se pudo asignar el técnico");
    }
  };

  const cambiarEstado = async (ticketId, nuevoEstado) => {
    try {
      await api.put("/api/tickets/estado", {
        ticketId,
        nuevoEstado,
        usuarioAccionId,
      });

      await cargarDatos();
    } catch (error) {
      console.error("Error cambiando estado", error);
      alert("No se pudo cambiar el estado");
    }
  };

  const cortarTexto = (texto = "", limite = 80) => {
    if (!texto) return "-";
    return texto.length > limite ? `${texto.substring(0, limite)}...` : texto;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPrioridadClass = (prioridad) => {
    if (!prioridad) return "baja";
    const p = prioridad.toLowerCase();
    if (p.includes("crit")) return "critica";
    if (p.includes("alt")) return "alta";
    if (p.includes("med")) return "media";
    return "baja";
  };

  const getEstadoClass = (estado) => {
    if (!estado) return "abierto";
    const e = estado.toLowerCase();
    if (e.includes("asig")) return "asignado";
    if (e.includes("proceso")) return "proceso";
    if (e.includes("resuel")) return "resuelto";
    if (e.includes("cerr")) return "cerrado";
    return "abierto";
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
      const ruta = String(adjunto.ruta).replaceAll("\\", "/");
      return `${api.defaults.baseURL || ""}/${ruta}`;
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

  const descargarAdjunto = async (adjunto) => {
    try {
      const url = obtenerUrlAdjunto(adjunto);

      if (!url || url === "#") {
        alert("No se encontró la ruta del archivo.");
        return;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = obtenerNombreAdjunto(adjunto);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error descargando archivo:", error);
      alert("No se pudo descargar el archivo.");
    }
  };

  const imprimirHtml = (titulo, html) => {
    const ventana = window.open("", "_blank", "width=980,height=720");

    if (!ventana) {
      alert("El navegador bloqueó la ventana emergente.");
      return;
    }

    ventana.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${titulo}</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              background: #ffffff;
              padding: 32px;
            }
            .pdf-page {
              max-width: 900px;
              margin: 0 auto;
              border: 1px solid #cbd5e1;
              padding: 28px;
            }
            .pdf-header {
              border-bottom: 3px solid #1e40af;
              padding-bottom: 16px;
              margin-bottom: 22px;
            }
            .pdf-header span {
              color: #1e40af;
              font-size: 12px;
              text-transform: uppercase;
              font-weight: 700;
            }
            .pdf-header h1 {
              margin: 5px 0 0;
              font-size: 25px;
            }
            .pdf-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px 22px;
              margin-bottom: 20px;
            }
            .pdf-item {
              border-bottom: 1px solid #e2e8f0;
              padding: 8px 0;
            }
            .pdf-item small {
              display: block;
              color: #64748b;
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 700;
            }
            .pdf-item strong {
              font-size: 14px;
            }
            .pdf-section {
              margin-top: 20px;
            }
            .pdf-section h2 {
              font-size: 15px;
              color: #1e40af;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
            }
            .pdf-section p {
              line-height: 1.55;
              white-space: pre-wrap;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th {
              background: #f1f5f9;
              text-align: left;
              padding: 9px;
              border: 1px solid #cbd5e1;
            }
            td {
              padding: 9px;
              border: 1px solid #e2e8f0;
            }
            @media print {
              body { padding: 0; }
              .pdf-page { border: none; }
            }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);

    ventana.document.close();
    ventana.focus();

    setTimeout(() => {
      ventana.print();
    }, 400);
  };

  const descargarPdfTicket = (ticket) => {
    const adjuntosHtml =
      ticket.adjuntos && ticket.adjuntos.length > 0
        ? `<ul>${ticket.adjuntos
            .map((a) => `<li>${obtenerNombreAdjunto(a)} — ${a.tipoArchivo || ""}</li>`)
            .join("")}</ul>`
        : "<p>Sin archivos adjuntos</p>";

    const html = `
      <div class="pdf-page">
        <div class="pdf-header">
          <span>Sistema de tickets</span>
          <h1>${ticket.codigo || "Ticket"}</h1>
        </div>

        <div class="pdf-grid">
          <div class="pdf-item"><small>Título</small><strong>${ticket.titulo || "-"}</strong></div>
          <div class="pdf-item"><small>Fecha</small><strong>${formatearFecha(ticket.fechaCreacion)}</strong></div>
          <div class="pdf-item"><small>Cliente</small><strong>${ticket.usuario?.nombreCompleto || "-"}</strong></div>
          <div class="pdf-item"><small>Técnico</small><strong>${ticket.tecnico?.nombreCompleto || "Sin asignar"}</strong></div>
          <div class="pdf-item"><small>Estado</small><strong>${ticket.estado || "-"}</strong></div>
          <div class="pdf-item"><small>Prioridad</small><strong>${ticket.prioridad || "-"}</strong></div>
          <div class="pdf-item"><small>Área destino</small><strong>${ticket.areaDestino || "-"}</strong></div>
          <div class="pdf-item"><small>Tipo solicitud</small><strong>${ticket.tipoSolicitud || "-"}</strong></div>
        </div>

        <div class="pdf-section">
          <h2>Descripción</h2>
          <p>${ticket.descripcion || "-"}</p>
        </div>

        <div class="pdf-section">
          <h2>Análisis IA</h2>
          <p>${ticket.respuestaIa || "Sin análisis de IA"}</p>
        </div>

        <div class="pdf-section">
          <h2>Observación / Resolución</h2>
          <p>${ticket.observacionResolucion || "Sin observación registrada"}</p>
        </div>

        <div class="pdf-section">
          <h2>Adjuntos</h2>
          ${adjuntosHtml}
        </div>
      </div>
    `;

    imprimirHtml(`Ticket ${ticket.codigo || ticket.id}`, html);
  };

  const descargarPdfListado = () => {
    const filas = ticketsFiltrados
      .map(
        (t) => `
          <tr>
            <td>${t.codigo || "-"}</td>
            <td>${t.titulo || "-"}</td>
            <td>${t.usuario?.nombreCompleto || "-"}</td>
            <td>${t.areaDestino || "-"}</td>
            <td>${t.prioridad || "-"}</td>
            <td>${t.estado || "-"}</td>
            <td>${t.tecnico?.nombreCompleto || "Sin asignar"}</td>
            <td>${formatearFecha(t.fechaCreacion)}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <div class="pdf-page">
        <div class="pdf-header">
          <span>Sistema de tickets</span>
          <h1>Listado general de tickets</h1>
        </div>

        <div class="pdf-section">
          <p>Total de registros: <strong>${ticketsFiltrados.length}</strong></p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Cliente</th>
              <th>Área</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Técnico</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${filas || `<tr><td colspan="8">Sin registros</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    imprimirHtml("Listado de tickets", html);
  };

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <div className="main-area">
        <Topbar usuario={usuario} />

        <main className="tickets-admin-main">
          <div className="tickets-admin-topbar">
            <div>
              <span className="tickets-admin-breadcrumb">
                Administración / Mesa de ayuda
              </span>
              <h2>Gestión de Tickets</h2>
            </div>

            <div className="tickets-admin-user">
              <span>Usuario administrador</span>
              <strong>{usuario?.email || "Administrador"}</strong>
            </div>
          </div>

          <section className="tickets-admin-page">
            <div className="tickets-admin-hero">
              <div>
                <span className="tickets-admin-label">Panel operativo</span>
                <h1>Tickets registrados</h1>
                <p>
                  Administre solicitudes, revise adjuntos, consulte el análisis IA
                  y genere reportes PDF por ticket o por listado general.
                </p>
              </div>

              <div className="tickets-admin-hero-actions">
                <button
                  type="button"
                  className="tickets-admin-btn-secondary"
                  onClick={cargarDatos}
                >
                  <RefreshCw size={16} />
                  Actualizar
                </button>

                <button
                  type="button"
                  className="tickets-admin-btn-secondary"
                  onClick={descargarPdfListado}
                >
                  <FileText size={16} />
                  PDF Lista
                </button>

                <button
                  type="button"
                  className="tickets-admin-btn-primary"
                  onClick={abrirCrear}
                >
                  <Plus size={17} />
                  Nuevo Ticket
                </button>
              </div>
            </div>

            <div className="tickets-admin-card">
              <div className="tickets-admin-toolbar">
                <div className="tickets-admin-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder="Buscar por código, cliente, descripción, IA, estado o técnico..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="tickets-admin-count">
                  <ClipboardList size={15} />
                  <strong>{ticketsFiltrados.length}</strong>
                  <span>registro(s)</span>
                </div>
              </div>

              <div className="tickets-admin-table-wrap">
                <table className="tickets-admin-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Ticket</th>
                      <th>IA</th>
                      <th>Área</th>
                      <th>Prioridad</th>
                      <th>Estado</th>
                      <th>Cliente</th>
                      <th>Técnico</th>
                      <th>Adjuntos</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando ? (
                      <tr>
                        <td colSpan="10" className="tickets-admin-empty">
                          Cargando tickets...
                        </td>
                      </tr>
                    ) : ticketsFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="tickets-admin-empty">
                          No hay tickets registrados
                        </td>
                      </tr>
                    ) : (
                      ticketsFiltrados.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <strong className="ticket-code">
                              {ticket.codigo || "-"}
                            </strong>
                            <small>{formatearFecha(ticket.fechaCreacion)}</small>
                          </td>

                          <td className="ticket-main-info">
                            <strong>{ticket.titulo || "Sin título"}</strong>
                            <small>{cortarTexto(ticket.descripcion, 90)}</small>
                          </td>

                          <td>
                            {ticket.analizadoPorIa ? (
                              <div className="ticket-ia-mini">
                                <Bot size={14} />
                                <div>
                                  <strong>{ticket.tipoSolicitud || "IA"}</strong>
                                  <small>{cortarTexto(ticket.respuestaIa, 55)}</small>
                                </div>
                              </div>
                            ) : (
                              <span className="ticket-badge neutral">Manual</span>
                            )}
                          </td>

                          <td>
                            <span className="ticket-badge area">
                              {ticket.areaDestino || "-"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`ticket-badge priority-${getPrioridadClass(
                                ticket.prioridad
                              )}`}
                            >
                              {ticket.prioridad || "-"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`ticket-badge status-${getEstadoClass(
                                ticket.estado
                              )}`}
                            >
                              {ticket.estado || "ABIERTO"}
                            </span>
                          </td>

                          <td>{ticket.usuario?.nombreCompleto || "-"}</td>

                          <td>{ticket.tecnico?.nombreCompleto || "Sin asignar"}</td>

                          <td>
                            {ticket.adjuntos && ticket.adjuntos.length > 0 ? (
                              <div className="ticket-adjuntos-table">
                                {ticket.adjuntos.map((adjunto, index) => (
                                  <div
                                    key={adjunto.id || index}
                                    className="ticket-adjunto-table-item"
                                  >
                                    <span
                                      className="ticket-adjunto-name"
                                      title={obtenerNombreAdjunto(adjunto)}
                                    >
                                      <Paperclip size={13} />
                                      {obtenerNombreAdjunto(adjunto)}
                                    </span>

                                    <button
                                      type="button"
                                      className="ticket-mini-btn view"
                                      title="Ver archivo"
                                      onClick={() => abrirAdjunto(adjunto)}
                                    >
                                      <Eye size={12} />
                                      Ver
                                    </button>

                                    <button
                                      type="button"
                                      className="ticket-mini-btn download"
                                      title="Descargar archivo"
                                      onClick={() => descargarAdjunto(adjunto)}
                                    >
                                      <Download size={12} />
                                      Descargar
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="ticket-badge neutral">
                                Sin archivos
                              </span>
                            )}
                          </td>

                          <td>
                            <div className="tickets-admin-actions">
                              <button
                                type="button"
                                className="ticket-action view"
                                title="Ver detalle"
                                onClick={() => abrirVer(ticket)}
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                type="button"
                                className="ticket-action pdf"
                                title="Descargar PDF"
                                onClick={() => descargarPdfTicket(ticket)}
                              >
                                <FileText size={15} />
                              </button>

                              <button
                                type="button"
                                className="ticket-action edit"
                                title="Editar"
                                onClick={() => abrirEditar(ticket)}
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                className="ticket-action delete"
                                title="Eliminar"
                                onClick={() => eliminarTicket(ticket)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>

      {drawerOpen && (
        <div className="tickets-drawer-overlay" onClick={cerrarDrawer}>
          <aside className="tickets-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="tickets-drawer-header">
              <div>
                <span>
                  {modo === "crear"
                    ? "Nuevo registro"
                    : modo === "editar"
                    ? "Edición de ticket"
                    : "Detalle del ticket"}
                </span>
                <h2>
                  {modo === "crear"
                    ? "Nuevo Ticket"
                    : ticketSeleccionado?.codigo || "Ticket"}
                </h2>
              </div>

              <button
                type="button"
                className="tickets-drawer-close"
                onClick={cerrarDrawer}
              >
                <X size={19} />
              </button>
            </div>

            {modo === "ver" && ticketSeleccionado && (
              <div className="tickets-drawer-body">
                <div className="ticket-detail-actions">
                  <button
                    type="button"
                    className="tickets-admin-btn-secondary"
                    onClick={() => window.print()}
                  >
                    <Printer size={15} />
                    Imprimir
                  </button>

                  <button
                    type="button"
                    className="tickets-admin-btn-primary"
                    onClick={() => descargarPdfTicket(ticketSeleccionado)}
                  >
                    <FileText size={15} />
                    PDF Ticket
                  </button>
                </div>

                <div className="ticket-detail-grid">
                  <div>
                    <small>Cliente</small>
                    <strong>{ticketSeleccionado.usuario?.nombreCompleto || "-"}</strong>
                  </div>
                  <div>
                    <small>Técnico</small>
                    <strong>
                      {ticketSeleccionado.tecnico?.nombreCompleto || "Sin asignar"}
                    </strong>
                  </div>
                  <div>
                    <small>Estado</small>
                    <span
                      className={`ticket-badge status-${getEstadoClass(
                        ticketSeleccionado.estado
                      )}`}
                    >
                      {ticketSeleccionado.estado || "ABIERTO"}
                    </span>
                  </div>
                  <div>
                    <small>Prioridad</small>
                    <span
                      className={`ticket-badge priority-${getPrioridadClass(
                        ticketSeleccionado.prioridad
                      )}`}
                    >
                      {ticketSeleccionado.prioridad || "-"}
                    </span>
                  </div>
                  <div>
                    <small>Área IA</small>
                    <strong>{ticketSeleccionado.areaDestino || "-"}</strong>
                  </div>
                  <div>
                    <small>Fecha</small>
                    <strong>{formatearFecha(ticketSeleccionado.fechaCreacion)}</strong>
                  </div>
                </div>

                <section className="ticket-detail-section">
                  <h3>Título</h3>
                  <p>{ticketSeleccionado.titulo || "-"}</p>
                </section>

                <section className="ticket-detail-section">
                  <h3>Descripción</h3>
                  <p>{ticketSeleccionado.descripcion || "-"}</p>
                </section>

                {ticketSeleccionado.analizadoPorIa && (
                  <section className="ticket-detail-section ticket-ai-box">
                    <h3>Análisis IA</h3>
                    <div className="ticket-ai-row">
                      <strong>Tipo:</strong>
                      <span>{ticketSeleccionado.tipoSolicitud || "-"}</span>
                    </div>
                    <div className="ticket-ai-row">
                      <strong>Área:</strong>
                      <span>{ticketSeleccionado.areaDestino || "-"}</span>
                    </div>
                    <p>{ticketSeleccionado.respuestaIa || "-"}</p>
                  </section>
                )}

                <section className="ticket-detail-section">
                  <h3>Archivos adjuntos</h3>

                  {ticketSeleccionado?.adjuntos &&
                  ticketSeleccionado.adjuntos.length > 0 ? (
                    <div className="ticket-adjuntos-list">
                      {ticketSeleccionado.adjuntos.map((adjunto, index) => (
                        <div
                          className="ticket-adjunto-item"
                          key={adjunto.id || index}
                        >
                          <div className="ticket-adjunto-info">
                            <Paperclip size={16} />

                            <div>
                              <strong title={obtenerNombreAdjunto(adjunto)}>
                                {obtenerNombreAdjunto(adjunto)}
                              </strong>

                              <small>
                                {adjunto.tipoArchivo || "Archivo adjunto"}
                              </small>
                            </div>
                          </div>

                          <div className="ticket-adjunto-actions">
                            <button
                              type="button"
                              className="ticket-adjunto-btn view"
                              title="Ver archivo"
                              onClick={() => abrirAdjunto(adjunto)}
                            >
                              <Eye size={15} />
                              Ver
                            </button>

                            <button
                              type="button"
                              className="ticket-adjunto-btn download"
                              title="Descargar archivo"
                              onClick={() => descargarAdjunto(adjunto)}
                            >
                              <Download size={15} />
                              Descargar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ticket-no-files">
                      <Paperclip size={18} />
                      No existen archivos adjuntos para este ticket.
                    </div>
                  )}
                </section>

                <section className="ticket-detail-section">
                  <h3>Gestión rápida</h3>

                  <div className="ticket-management-row">
                    <label>Estado</label>
                    <select
                      value={ticketSeleccionado.estado || "ABIERTO"}
                      onChange={(e) =>
                        cambiarEstado(ticketSeleccionado.id, e.target.value)
                      }
                    >
                      <option value="ABIERTO">ABIERTO</option>
                      <option value="ASIGNADO">ASIGNADO</option>
                      <option value="EN_PROCESO">EN PROCESO</option>
                      <option value="RESUELTO">RESUELTO</option>
                      <option value="CERRADO">CERRADO</option>
                    </select>
                  </div>

                  <div className="ticket-management-row">
                    <label>Técnico</label>
                    <select
                      value={ticketSeleccionado.tecnico?.id || ""}
                      onChange={(e) =>
                        asignarTecnico(ticketSeleccionado.id, e.target.value)
                      }
                    >
                      <option value="">Sin asignar</option>
                      {tecnicos.map((tecnico) => (
                        <option key={tecnico.id} value={tecnico.id}>
                          {tecnico.nombreCompleto}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>
              </div>
            )}

            {(modo === "crear" || modo === "editar") && (
              <form className="tickets-drawer-body" onSubmit={guardarTicket}>
                {ticketSeleccionado?.analizadoPorIa && (
                  <div className="ticket-ai-box">
                    <Bot size={18} />
                    <div>
                      <strong>Análisis IA</strong>
                      <p>
                        <b>Tipo:</b> {ticketSeleccionado.tipoSolicitud}
                      </p>
                      <p>
                        <b>Área:</b> {ticketSeleccionado.areaDestino}
                      </p>
                      <p>{ticketSeleccionado.respuestaIa}</p>
                    </div>
                  </div>
                )}

                <div className="ticket-form-group">
                  <label>Título</label>
                  <input
                    value={form.titulo}
                    onChange={(e) =>
                      setForm({ ...form, titulo: e.target.value })
                    }
                    placeholder="Ejemplo: Error al iniciar sesión"
                  />
                </div>

                <div className="ticket-form-group">
                  <label>Descripción</label>
                  <textarea
                    rows="5"
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm({ ...form, descripcion: e.target.value })
                    }
                    placeholder="Describe el problema o requerimiento"
                  />
                </div>

                <div className="ticket-form-group">
                  <label>Prioridad</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) =>
                      setForm({ ...form, prioridad: e.target.value })
                    }
                  >
                    <option value="BAJA">BAJA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="CRITICA">CRÍTICA</option>
                  </select>
                </div>

                <div className="ticket-form-group">
                  <label>Categoría</label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) =>
                      setForm({ ...form, categoriaId: e.target.value })
                    }
                  >
                    <option value="">Seleccione</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ticket-form-group">
                  <label>Fecha límite</label>
                  <input
                    type="date"
                    value={form.fechaLimite}
                    onChange={(e) =>
                      setForm({ ...form, fechaLimite: e.target.value })
                    }
                  />
                </div>

                <div className="ticket-form-group">
                  <label>Tiempo estimado en horas</label>
                  <input
                    type="number"
                    min="1"
                    value={form.tiempoEstimadoHoras}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tiempoEstimadoHoras: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="tickets-drawer-actions">
                  <button
                    type="button"
                    className="tickets-admin-btn-secondary"
                    onClick={cerrarDrawer}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="tickets-admin-btn-primary">
                    {modo === "crear" ? "Guardar Ticket" : "Actualizar Ticket"}
                  </button>
                </div>
              </form>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
