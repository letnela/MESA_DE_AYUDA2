import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  X,
  RefreshCw,
  Users,
} from "lucide-react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./css/usuarios-admin.css";

export default function Usuarios() {
  const usuarioStorage = localStorage.getItem("usuario");

  const usuario =
    usuarioStorage && usuarioStorage !== "undefined"
      ? JSON.parse(usuarioStorage)
      : null;

  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modo, setModo] = useState("crear");
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [form, setForm] = useState({
    nombreCompleto: "",
    email: "",
    password: "",
    rol: "USUARIO",
  });

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const res = await api.get("/usuarios");
      setUsuarios(res.data || []);
    } catch (error) {
      console.error("Error cargando usuarios", error);
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const abrirCrear = () => {
    setModo("crear");
    setUsuarioEditando(null);
    setForm({
      nombreCompleto: "",
      email: "",
      password: "",
      rol: "USUARIO",
    });
    setDrawerOpen(true);
  };

  const abrirEditar = (usuarioFila) => {
    setModo("editar");
    setUsuarioEditando(usuarioFila);

    setForm({
      nombreCompleto: usuarioFila.nombreCompleto || "",
      email: usuarioFila.email || "",
      password: "",
      rol: usuarioFila.rol?.nombre || usuarioFila.rol || "USUARIO",
    });

    setDrawerOpen(true);
  };

  const cerrarDrawer = () => {
    setDrawerOpen(false);
    setUsuarioEditando(null);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();

    if (!form.nombreCompleto.trim()) {
      alert("Ingrese el nombre completo");
      return;
    }

    if (!form.email.trim()) {
      alert("Ingrese el correo");
      return;
    }

    if (modo === "crear" && !form.password.trim()) {
      alert("Ingrese la contraseña");
      return;
    }

    try {
      const payload = {
        nombreCompleto: form.nombreCompleto,
        email: form.email,
        password: form.password,
        rol: form.rol,
      };

      if (modo === "crear") {
        await api.post("/usuarios", payload);
        alert("Usuario creado correctamente");
      } else {
        await api.put(`/usuarios/${usuarioEditando.id}`, payload);
        alert("Usuario actualizado correctamente");
      }

      cerrarDrawer();
      cargarUsuarios();
    } catch (error) {
      console.error("Error guardando usuario", error);
      alert("Error guardando usuario");
    }
  };

  const cambiarEstado = async (id) => {
    try {
      await api.patch(`/usuarios/${id}/estado`);
      cargarUsuarios();
    } catch (error) {
      console.error("Error cambiando estado", error);
      alert("Error cambiando estado");
    }
  };

  const eliminarUsuario = async (usuarioFila) => {
    const confirmar = confirm(
      `¿Seguro que deseas eliminar a ${usuarioFila.nombreCompleto}?`
    );

    if (!confirmar) return;

    try {
      await api.delete(`/usuarios/${usuarioFila.id}`);
      alert("Usuario eliminado correctamente");
      cargarUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario", error);
      alert("No se pudo eliminar usuario");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    `
      ${u.nombreCompleto || ""}
      ${u.email || ""}
      ${u.rol?.nombre || u.rol || ""}
    `
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar usuario={usuario} />

      <div className="main-area">
        <Topbar usuario={usuario} />

        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1>Usuarios</h1>
              <p className="subtitle">
                Administra administradores, técnicos y usuarios del sistema
              </p>
            </div>

            <div className="header-actions">
              <button className="secondary-btn" onClick={cargarUsuarios}>
                <RefreshCw size={17} />
                Actualizar
              </button>

              <button className="primary-btn" onClick={abrirCrear}>
                <Plus size={18} />
                Nuevo Usuario
              </button>
            </div>
          </div>

          <div className="stats-grid category-summary">
            <div className="stat-card purple">
              <div className="stat-icon">
                <Users size={28} />
              </div>

              <div>
                <p>Total Usuarios</p>
                <strong>{usuarios.length}</strong>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-toolbar">
              <div className="search-box">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Buscar usuario por nombre, correo o rol..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <span className="table-count">
                Total: {usuariosFiltrados.length}
              </span>
            </div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cargando ? (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        No hay usuarios registrados
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((u) => (
                      <tr key={u.id}>
                        <td data-label="Usuario">
                          <strong>{u.nombreCompleto}</strong>
                        </td>

                        <td data-label="Correo">{u.email}</td>

                        <td data-label="Rol">
                          <span className="badge">
                            {u.rol?.nombre || u.rol}
                          </span>
                        </td>

                        <td data-label="Estado">
                          <span
                            className={
                              u.estado
                                ? "badge state-RESUELTO"
                                : "badge state-CERRADO"
                            }
                          >
                            {u.estado ? "ACTIVO" : "INACTIVO"}
                          </span>
                        </td>

                        <td data-label="Acciones">
                          <div className="action-buttons">
                            <button
                              className="icon-btn edit"
                              title="Editar"
                              onClick={() => abrirEditar(u)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="icon-btn view"
                              title="Activar / desactivar"
                              onClick={() => cambiarEstado(u.id)}
                            >
                              <Power size={16} />
                            </button>

                            <button
                              className="icon-btn delete"
                              title="Eliminar"
                              onClick={() => eliminarUsuario(u)}
                            >
                              <Trash2 size={16} />
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
        </main>
      </div>

      {drawerOpen && (
        <div className="drawer-overlay" onClick={cerrarDrawer}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h2>
                  {modo === "crear" ? "Nuevo Usuario" : "Editar Usuario"}
                </h2>
                <p>
                  {modo === "crear"
                    ? "Registra un usuario para el sistema"
                    : "Actualiza la información del usuario"}
                </p>
              </div>

              <button className="drawer-close" onClick={cerrarDrawer}>
                <X size={20} />
              </button>
            </div>

            <form className="drawer-body" onSubmit={guardarUsuario}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={form.nombreCompleto}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombreCompleto: e.target.value,
                    })
                  }
                  placeholder="Ej. Carlos Soporte"
                />
              </div>

              <div className="form-group">
                <label>Correo</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="usuario@correo.com"
                />
              </div>

              <div className="form-group">
                <label>
                  Contraseña {modo === "editar" && "(opcional)"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  placeholder={
                    modo === "crear"
                      ? "Contraseña"
                      : "Dejar vacío para no cambiar"
                  }
                />
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select
                  value={form.rol}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rol: e.target.value,
                    })
                  }
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="TECNICO">TECNICO</option>
                  <option value="USUARIO">USUARIO</option>
                </select>
              </div>

              <div className="drawer-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={cerrarDrawer}
                >
                  Cancelar
                </button>

                <button type="submit" className="primary-btn">
                  {modo === "crear" ? "Guardar Usuario" : "Actualizar Usuario"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}