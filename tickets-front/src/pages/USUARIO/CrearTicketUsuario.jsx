import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle,
  FileUp,
  X,
  Paperclip,
} from "lucide-react";

import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import "../css/crear-ticket-usuario.css";

export default function CrearTicketUsuario() {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const usuarioId = localStorage.getItem("usuarioId");

  const [previewIA, setPreviewIA] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [archivos, setArchivos] = useState([]);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
  });

  const handleChange = (e) => {
    setPreviewIA(null);
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleArchivos = (e) => {
    const nuevosArchivos = Array.from(e.target.files);
    setArchivos((prev) => [...prev, ...nuevosArchivos]);
  };

  const eliminarArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

const analizarConIA = async () => {
  if (!form.titulo.trim() || !form.descripcion.trim()) {
    alert("Por favor, ingrese el título y la descripción.");
    return;
  }

  try {
    setAnalizando(true);

    const formData = new FormData();

    formData.append(
      "ticket",
      new Blob(
        [
          JSON.stringify({
            titulo: form.titulo,
            descripcion: form.descripcion,
          }),
        ],
        { type: "application/json" }
      )
    );

    archivos.forEach((archivo) => {
      formData.append("archivos", archivo);
    });

    const { data } = await api.post("/api/ia/analizar-ticket", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setPreviewIA(data);
  } catch (error) {
    console.error("Error analizando con IA:", error);
    alert("No se pudo conectar con el servicio de análisis.");
  } finally {
    setAnalizando(false);
  }
};

  const crearTicketConIA = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      alert("Por favor, complete todos los campos requeridos.");
      return;
    }

    try {
      setGuardando(true);
      const formData = new FormData();

      formData.append(
        "ticket",
        new Blob(
          [
            JSON.stringify({
              titulo: form.titulo,
              descripcion: form.descripcion,
            }),
          ],
          { type: "application/json" }
        )
      );

      archivos.forEach((archivo) => {
        formData.append("archivos", archivo);
      });

      await api.post(`/api/tickets/cliente?usuarioId=${usuarioId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Ticket registrado en el sistema.");
      navigate("/usuario/mis-tickets");
    } catch (error) {
      console.error("Error creando ticket:", error);
      alert("Error de red al procesar el ticket.");
    } finally {
      setGuardando(false);
    }
  };

  const getPrioridadClass = (prioridad) => {
    if (!prioridad) return "";
    const p = prioridad.toLowerCase();
    if (p.includes("alt")) return "alta";
    if (p.includes("med")) return "media";
    return "baja";
  };

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <main className="crear-ticket-main">
        {/* Topbar del Sistema */}
        <div className="crear-ticket-topbar">
          <div>
            <span className="crear-ticket-breadcrumb">Panel / Solicitudes / Nuevo</span>
            <h2>Crear Ticket de Soporte</h2>
          </div>

          <div className="crear-ticket-user">
            <span>Usuario autenticado</span>
            <strong>{usuario.email}</strong>
          </div>
        </div>

        <section className="crear-ticket-page">
          
          {/* Banner de Ayuda Sobrio */}
          <div className="crear-ticket-hero">
            <div>
              <span className="crear-ticket-label">Módulo de Automatización</span>
              <h1>Formulario de Incidencias</h1>
              <p>
                Complete la información detallada del problema. El sistema derivará
                automáticamente el caso al departamento técnico correspondiente a través de IA.
              </p>
            </div>
            <div className="crear-ticket-hero-icon">
              <Bot size={32} />
            </div>
          </div>

          {/* Grid de Datos a la misma altura */}
          <div className="crear-ticket-grid">
            
            {/* Formulario */}
            <div className="crear-ticket-card">
              <div className="crear-ticket-section-title">
                <h3>Detalles de la Solicitud</h3>
                <p>Todos los campos son obligatorios para el análisis del sistema.</p>
              </div>

              <div className="crear-ticket-form-group">
                <label htmlFor="titulo-input">Título Breve</label>
                <input
                  id="titulo-input"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Describa brevemente la incidencia"
                />
              </div>

              <div className="crear-ticket-form-group">
                <label htmlFor="descripcion-input">Descripción Detallada</label>
                <textarea
                  id="descripcion-input"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Especifique los síntomas, errores y pasos ejecutados..."
                />
              </div>

              <div className="crear-ticket-upload-box">
                <input
                  id="archivos"
                  type="file"
                  multiple
                  onChange={handleArchivos}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                />
                <label htmlFor="archivos">
                  <FileUp size={18} />
                  <strong>Adjuntar archivos y registros de error</strong>
                  <span>(Formatos admitidos: Documentos, Imágenes, Comprimidos)</span>
                </label>
              </div>

              {archivos.length > 0 && (
                <div className="crear-ticket-files">
                  <h4>
                    <Paperclip size={14} />
                    Documentación Adjunta ({archivos.length})
                  </h4>

                  {archivos.map((archivo, index) => (
                    <div className="crear-ticket-file-item" key={index}>
                      <div>
                        <strong>{archivo.name}</strong>
                        <span>{(archivo.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarArchivo(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="crear-ticket-actions">
                <button
                  type="button"
                  className="crear-ticket-btn-secondary"
                  onClick={analizarConIA}
                  disabled={analizando || guardando}
                >
                  <Sparkles size={16} />
                  {analizando ? "Procesando..." : "Previsualizar IA"}
                </button>

                <button
                  type="button"
                  className="crear-ticket-btn-primary"
                  onClick={crearTicketConIA}
                  disabled={guardando || analizando}
                >
                  <Send size={16} />
                  {guardando ? "Registrando..." : "Enviar Ticket"}
                </button>
              </div>
            </div>

            {/* Panel Inteligente Corporativo */}
            <div className="crear-ticket-card crear-ticket-ai-card">
              <div className="crear-ticket-ai-header">
                <Bot size={20} className="crear-ticket-ai-icon" />
                <div>
                  <h3>Diagnóstico de Pre-clasificación</h3>
                  <p>Métricas generadas por el motor inteligente.</p>
                </div>
              </div>

              {!previewIA ? (
                <div className="crear-ticket-empty-ai">
                  <Sparkles size={24} className="sparkle-icon" />
                  <h4>Sin datos de diagnóstico</h4>
                  <p>
                    Haga clic en el botón de previsualización para ejecutar el motor de reglas.
                  </p>
                </div>
              ) : (
                <div className="crear-ticket-ai-result">
                  <div className="crear-ticket-ai-row">
                    <span className="ai-title">Categoría</span>
                    <span className="ai-value">{previewIA.tipoSolicitud}</span>
                  </div>

                  <div className="crear-ticket-ai-row">
                    <span className="ai-title">Área de Destino</span>
                    <span className="ai-value">{previewIA.areaDestino}</span>
                  </div>

                  <div className="crear-ticket-ai-row">
                    <span className="ai-title">Complejidad / Prioridad</span>
                    <span className={`badge-prioridad ${getPrioridadClass(previewIA.prioridad)}`}>
                      {previewIA.prioridad}
                    </span>
                  </div>

                  <div className="crear-ticket-ai-message">
                    <strong>Respuesta Sugerida por el Sistema:</strong>
                    <p style={{ marginTop: "4px", margin: 0 }}>{previewIA.respuestaSugerida}</p>
                  </div>

                  <div className="crear-ticket-ai-ok">
                    <CheckCircle size={14} />
                    <span>Clasificación conforme con las políticas del sistema.</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}