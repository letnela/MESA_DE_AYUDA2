import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X, Tags, RefreshCw, FolderKanban } from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./css/categorias-admin.css";

export default function Categorias() {
  const usuarioStorage = localStorage.getItem("usuario");

  const usuario =
    usuarioStorage && usuarioStorage !== "undefined"
      ? JSON.parse(usuarioStorage)
      : {
          email: "admin@gmail.com",
          rol: "ADMIN",
        };

  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const res = await api.get("/api/categorias");
      setCategorias(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando categorías", error);
      setCategorias([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const abrirDrawer = () => {
    setNombre("");
    setDrawerOpen(true);
  };

  const cerrarDrawer = () => {
    setDrawerOpen(false);
    setNombre("");
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("Ingrese el nombre de la categoría");
      return;
    }

    try {
      setGuardando(true);

      await api.post("/api/categorias", {
        nombre: nombre.trim(),
        estado: true,
      });

      await cargarCategorias();
      cerrarDrawer();
      alert("Categoría creada correctamente");
    } catch (error) {
      console.error("Error creando categoría", error);
      alert("Error creando categoría");
    } finally {
      setGuardando(false);
    }
  };

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((categoria) =>
      `${categoria.nombre || ""}`.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [categorias, busqueda]);

  const categoriasActivas = categorias.filter((c) => c.estado !== false).length;
  const categoriasInactivas = categorias.filter((c) => c.estado === false).length;

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <div className="main-area">
        <Topbar usuario={usuario} />

        <main className="categorias-admin-main">
          <div className="categorias-admin-topbar">
            <div>
              <span className="categorias-admin-breadcrumb">
                Administración / Catálogo
              </span>
              <h2>Categorías</h2>
            </div>

            <div className="categorias-admin-user">
              <span>Usuario administrador</span>
              <strong>{usuario?.email || "Administrador"}</strong>
            </div>
          </div>

          <section className="categorias-admin-page">
            <div className="categorias-admin-hero">
              <div>
                <span className="categorias-admin-label">Clasificación de tickets</span>
                <h1>Gestión de categorías</h1>
                <p>
                  Administra las categorías utilizadas para clasificar tickets y
                  mantener organizada la mesa de ayuda.
                </p>
              </div>

              <div className="categorias-admin-hero-actions">
                <button
                  type="button"
                  className="categorias-admin-btn-secondary"
                  onClick={cargarCategorias}
                  disabled={cargando}
                >
                  <RefreshCw size={16} />
                  {cargando ? "Actualizando..." : "Actualizar"}
                </button>

                <button
                  type="button"
                  className="categorias-admin-btn-primary"
                  onClick={abrirDrawer}
                >
                  <Plus size={17} />
                  Nueva Categoría
                </button>
              </div>
            </div>

            <div className="categorias-admin-summary-grid">
              <div className="categorias-admin-summary-card">
                <div className="categorias-admin-summary-icon blue">
                  <Tags size={22} />
                </div>
                <div>
                  <span>Total categorías</span>
                  <strong>{categorias.length}</strong>
                </div>
              </div>

              <div className="categorias-admin-summary-card">
                <div className="categorias-admin-summary-icon green">
                  <FolderKanban size={22} />
                </div>
                <div>
                  <span>Activas</span>
                  <strong>{categoriasActivas}</strong>
                </div>
              </div>

              <div className="categorias-admin-summary-card">
                <div className="categorias-admin-summary-icon gray">
                  <FolderKanban size={22} />
                </div>
                <div>
                  <span>Inactivas</span>
                  <strong>{categoriasInactivas}</strong>
                </div>
              </div>
            </div>

            <div className="categorias-admin-card">
              <div className="categorias-admin-toolbar">
                <div className="categorias-admin-search">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder="Buscar categoría..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="categorias-admin-count">
                  <Tags size={15} />
                  <strong>{categoriasFiltradas.length}</strong>
                  <span>registro(s)</span>
                </div>
              </div>

              <div className="categorias-admin-table-wrap">
                <table className="categorias-admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando ? (
                      <tr>
                        <td colSpan="2" className="categorias-admin-empty">
                          Cargando categorías...
                        </td>
                      </tr>
                    ) : categoriasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="categorias-admin-empty">
                          No hay categorías registradas.
                        </td>
                      </tr>
                    ) : (
                      categoriasFiltradas.map((categoria) => (
                        <tr key={categoria.id}>
                          <td>
                            <div className="categorias-admin-name">
                              <div className="categorias-admin-name-icon">
                                <Tags size={15} />
                              </div>

                              <div>
                                <strong>{categoria.nombre}</strong>
                                <small>ID: {categoria.id}</small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`categorias-admin-badge ${
                                categoria.estado === false ? "inactive" : "active"
                              }`}
                            >
                              {categoria.estado === false ? "INACTIVA" : "ACTIVA"}
                            </span>
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
        <div className="categorias-admin-drawer-overlay" onClick={cerrarDrawer}>
          <aside
            className="categorias-admin-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="categorias-admin-drawer-header">
              <div>
                <h2>Nueva Categoría</h2>
                <p>Registra una categoría para clasificar tickets.</p>
              </div>

              <button
                type="button"
                className="categorias-admin-drawer-close"
                onClick={cerrarDrawer}
              >
                <X size={20} />
              </button>
            </div>

            <form className="categorias-admin-drawer-body" onSubmit={guardarCategoria}>
              <div className="categorias-admin-form-group">
                <label>Nombre de la categoría</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Software, Hardware, Redes..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="categorias-admin-info-box">
                <Tags size={18} />
                <p>
                  La categoría quedará activa y podrá ser usada al registrar o
                  editar tickets.
                </p>
              </div>

              <div className="categorias-admin-drawer-actions">
                <button
                  type="button"
                  className="categorias-admin-btn-secondary"
                  onClick={cerrarDrawer}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="categorias-admin-btn-primary"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar Categoría"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
