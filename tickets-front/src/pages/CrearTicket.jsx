import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  FolderTree,
  Gauge,
  Save,
  Ticket,
} from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./css/crear-ticket-admin.css";

export default function CrearTicket() {
  const navigate = useNavigate();

  const usuarioStorage = localStorage.getItem("usuario");

  const usuario =
    usuarioStorage && usuarioStorage !== "undefined"
      ? JSON.parse(usuarioStorage)
      : null;

  const [categorias, setCategorias] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "MEDIA",
    categoriaId: "",
    fechaLimite: "",
    tiempoEstimadoHoras: "",
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const res = await api.get("/api/categorias");
      setCategorias(res.data || []);
    } catch (error) {
      console.error("Error cargando categorías", error);
    }
  };

  const handleChange = (campo, valor) => {
    setForm({
      ...form,
      [campo]: valor,
    });
  };

  const obtenerCategoriaNombre = () => {
    const categoria = categorias.find((item) => item.id === form.categoriaId);
    return categoria?.nombre || "Sin categoría";
  };

  const guardar = async (e) => {
    e.preventDefault();

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

    const usuarioId = usuario?.id || localStorage.getItem("usuarioId");

    if (!usuarioId) {
      alert("No se encontró el usuario logueado. Cierre sesión e ingrese nuevamente.");
      return;
    }

    try {
      setGuardando(true);

      await api.post(`/api/tickets?usuarioId=${usuarioId}`, {
        titulo: form.titulo,
        descripcion: form.descripcion,
        prioridad: form.prioridad,
        categoriaId: form.categoriaId,
        fechaLimite: form.fechaLimite ? `${form.fechaLimite}T23:59:00` : null,
        tiempoEstimadoHoras: form.tiempoEstimadoHoras
          ? Number(form.tiempoEstimadoHoras)
          : null,
      });

      alert("Ticket creado correctamente");
      navigate("/tickets");
    } catch (error) {
      console.error("Error al crear ticket", error);

      if (error.response) {
        console.log(error.response.data);
      }

      alert("Error al crear ticket");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <div className="main-area">
        <Topbar usuario={usuario} />

        <main className="crear-admin-main">
          <div className="crear-admin-top">
            <div>
              <span className="crear-admin-breadcrumb">
                Administración / Tickets / Nuevo
              </span>
              <h1>Nuevo Ticket</h1>
              <p>Registrar incidencia o requerimiento desde el panel administrativo.</p>
            </div>

            <button
              type="button"
              className="crear-admin-back"
              onClick={() => navigate("/tickets")}
            >
              <ArrowLeft size={17} />
              Volver
            </button>
          </div>

          <section className="crear-admin-hero">
            <div className="crear-admin-hero-icon">
              <Ticket size={34} />
            </div>

            <div>
              <span>Registro administrativo</span>
              <h2>Crear solicitud interna</h2>
              <p>
                Complete los datos del ticket. El registro quedará disponible para
                seguimiento, asignación técnica y gestión de estados.
              </p>
            </div>
          </section>

          <form className="crear-admin-grid" onSubmit={guardar}>
            <div className="crear-admin-card">
              <div className="crear-admin-card-title">
                <h3>Información principal</h3>
                <p>Datos base para identificar y clasificar la solicitud.</p>
              </div>

              <div className="crear-admin-form-group">
                <label>Título</label>
                <input
                  type="text"
                  placeholder="Ej. Error al iniciar sesión"
                  value={form.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                />
              </div>

              <div className="crear-admin-form-group">
                <label>Descripción</label>
                <textarea
                  rows="7"
                  placeholder="Detalle del problema o requerimiento"
                  value={form.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                />
              </div>

              <div className="crear-admin-row">
                <div className="crear-admin-form-group">
                  <label>Prioridad</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => handleChange("prioridad", e.target.value)}
                  >
                    <option value="BAJA">BAJA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="CRITICA">CRÍTICA</option>
                  </select>
                </div>

                <div className="crear-admin-form-group">
                  <label>Categoría</label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => handleChange("categoriaId", e.target.value)}
                  >
                    <option value="">Seleccione una categoría</option>

                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="crear-admin-row">
                <div className="crear-admin-form-group">
                  <label>Fecha límite</label>
                  <input
                    type="date"
                    value={form.fechaLimite}
                    onChange={(e) => handleChange("fechaLimite", e.target.value)}
                  />
                </div>

                <div className="crear-admin-form-group">
                  <label>Tiempo estimado (horas)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej. 4"
                    value={form.tiempoEstimadoHoras}
                    onChange={(e) =>
                      handleChange("tiempoEstimadoHoras", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="crear-admin-actions">
                <button
                  type="button"
                  className="crear-admin-btn-secondary"
                  onClick={() => navigate("/tickets")}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="crear-admin-btn-primary"
                  disabled={guardando}
                >
                  <Save size={17} />
                  {guardando ? "Guardando..." : "Guardar Ticket"}
                </button>
              </div>
            </div>

            <aside className="crear-admin-card crear-admin-summary">
              <div className="crear-admin-card-title">
                <h3>Resumen del ticket</h3>
                <p>Vista previa antes del registro.</p>
              </div>

              <div className="crear-admin-summary-box">
                <div className="crear-admin-summary-code">
                  <Ticket size={22} />
                  <div>
                    <span>Código</span>
                    <strong>Se generará automáticamente</strong>
                  </div>
                </div>

                <div className="crear-admin-summary-item">
                  <div>
                    <FolderTree size={18} />
                    <span>Categoría</span>
                  </div>
                  <strong>{obtenerCategoriaNombre()}</strong>
                </div>

                <div className="crear-admin-summary-item">
                  <div>
                    <Gauge size={18} />
                    <span>Prioridad</span>
                  </div>
                  <strong className={`crear-admin-priority ${form.prioridad.toLowerCase()}`}>
                    {form.prioridad}
                  </strong>
                </div>

                <div className="crear-admin-summary-item">
                  <div>
                    <CalendarClock size={18} />
                    <span>Fecha límite</span>
                  </div>
                  <strong>{form.fechaLimite || "Sin fecha"}</strong>
                </div>

                <div className="crear-admin-summary-item">
                  <div>
                    <Clock size={18} />
                    <span>Tiempo estimado</span>
                  </div>
                  <strong>
                    {form.tiempoEstimadoHoras
                      ? `${form.tiempoEstimadoHoras} hora(s)`
                      : "No definido"}
                  </strong>
                </div>
              </div>

              <div className="crear-admin-preview">
                <span>Título</span>
                <h4>{form.titulo || "Sin título ingresado"}</h4>

                <span>Descripción</span>
                <p>{form.descripcion || "La descripción aparecerá aquí."}</p>
              </div>
            </aside>
          </form>
        </main>
      </div>
    </div>
  );
}
