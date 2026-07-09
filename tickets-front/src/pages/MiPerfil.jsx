import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

import "./css/mi-perfil.css";
export default function MiPerfil() {
  const [perfil, setPerfil] = useState({
    nombreCompleto: "",
    email: "",
    rol: "",
    estado: true,
  });

  const [password, setPassword] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmar: "",
  });

  const getUsuarioId = () => {
    return localStorage.getItem("usuarioId");
  };

  const cargarPerfil = async () => {
    try {
      const usuarioId = getUsuarioId();

      if (!usuarioId) {
        return;
      }

      const res = await api.get(`/usuarios/perfil/${usuarioId}`);

      setPerfil({
        nombreCompleto: res.data.nombreCompleto || "",
        email: res.data.email || "",
        rol: res.data.rol?.nombre || res.data.rol || "",
        estado: res.data.estado,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const guardarPerfil = async (e) => {
    e.preventDefault();

    try {
      const usuarioId = getUsuarioId();

      await api.put(`/usuarios/perfil/${usuarioId}`, {
        nombreCompleto: perfil.nombreCompleto,
        email: perfil.email,
      });

      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error actualizando perfil");
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();

    if (password.passwordNueva !== password.confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const usuarioId = getUsuarioId();

      await api.put(`/usuarios/perfil/${usuarioId}/password`, {
        passwordActual: password.passwordActual,
        passwordNueva: password.passwordNueva,
      });

      alert("Contraseña actualizada correctamente");

      setPassword({
        passwordActual: "",
        passwordNueva: "",
        confirmar: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error cambiando contraseña");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <div className="dashboard-content">

          <div className="perfil-header">
            <h1>Mi Perfil</h1>
            <p>Gestiona tu información personal y seguridad de cuenta</p>
          </div>

          <div className="perfil-grid">

            <div className="perfil-card">

              <div className="perfil-avatar">
                <div className="avatar-circle">
                  {(perfil.nombreCompleto || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2>{perfil.nombreCompleto || "Usuario"}</h2>
                  <span>{perfil.rol || "SIN ROL"}</span>
                </div>
              </div>

              <form
                onSubmit={guardarPerfil}
                className="perfil-form"
              >
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    value={perfil.nombreCompleto}
                    onChange={(e) =>
                      setPerfil({
                        ...perfil,
                        nombreCompleto: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Correo electrónico</label>
                  <input
                    type="email"
                    value={perfil.email}
                    onChange={(e) =>
                      setPerfil({
                        ...perfil,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="perfil-row">
                  <div className="form-group">
                    <label>Rol</label>
                    <input
                      value={perfil.rol}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label>Estado</label>
                    <input
                      value={
                        perfil.estado
                          ? "ACTIVO"
                          : "INACTIVO"
                      }
                      disabled
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  Guardar cambios
                </button>
              </form>

            </div>

            <div className="perfil-card">

              <h2>Cambiar contraseña</h2>

              <p className="card-text">
                Actualiza tu contraseña para mantener segura tu cuenta.
              </p>

              <form
                onSubmit={cambiarPassword}
                className="perfil-form"
              >
                <div className="form-group">
                  <label>Contraseña actual</label>
                  <input
                    type="password"
                    value={password.passwordActual}
                    onChange={(e) =>
                      setPassword({
                        ...password,
                        passwordActual: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    value={password.passwordNueva}
                    onChange={(e) =>
                      setPassword({
                        ...password,
                        passwordNueva: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar contraseña</label>
                  <input
                    type="password"
                    value={password.confirmar}
                    onChange={(e) =>
                      setPassword({
                        ...password,
                        confirmar: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn-secondary"
                >
                  Actualizar contraseña
                </button>
              </form>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}