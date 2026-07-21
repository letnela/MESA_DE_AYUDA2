import { useState } from "react";
import api from "../api/axios";
import "./css/Login.css";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const login = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password.trim(),
      });

      console.log("Respuesta Login:", data);

      const token =
        data.token ||
        data.accessToken ||
        data.jwt;

      const rol = (data.rol || data.role || "")
        .trim()
        .toUpperCase();

      const usuarioId =
        data.usuarioId ||
        data.id ||
        "";

      if (!token) {
        alert("El backend no está enviando el token.");
        return;
      }

      if (!rol) {
        alert("El backend no está enviando el rol del usuario.");
        return;
      }

      localStorage.clear();

      localStorage.setItem("token", token);
      localStorage.setItem("rol", rol);
      localStorage.setItem("usuarioId", usuarioId);

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id: usuarioId,
          email: data.email || form.email,
          nombreCompleto:
            data.nombreCompleto ||
            data.nombre ||
            "",
          rol,
        })
      );

      switch (rol) {
        case "ADMIN":
          window.location.replace("/admin/dashboard");
          break;

        case "TECNICO":
          window.location.replace("/tecnico/dashboard");
          break;

        case "USUARIO":
          window.location.replace("/usuario/dashboard");
          break;

        default:
          alert("Rol no reconocido: " + rol);
          localStorage.clear();
      }

    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(
          error.response.data?.message ||
          "Credenciales incorrectas."
        );
      } else {
        alert("No se pudo conectar con el servidor.");
      }
    }
  };

  return (
    <div className="login-shell">

      {/* Panel izquierdo: contexto del sistema */}
      <aside className="login-aside">
        <div className="aside-top">
          <div className="brand">
            <span className="brand-mark">CT</span>
            <div className="brand-text">
              <span className="brand-org">Cibertec</span>
              <span className="brand-name">Sistema de Tickets</span>
            </div>
          </div>

          <h1>Todo tu soporte técnico, en un solo lugar.</h1>
          <p>
            Reporta incidencias, dale seguimiento y mantente informado
            durante todo el proceso.
          </p>
        </div>

        <div className="aside-bottom">
          <div className="aside-stat">
            <b>24/7</b>
            <span>Soporte técnico</span>
          </div>
        </div>
      </aside>

      {/* Panel derecho: formulario */}
      <main className="login-main">
        <form className="login-card" onSubmit={login}>

          <div className="login-card-header">
            <h2>Iniciar sesión</h2>
            <p>Ingresa tus credenciales para acceder al sistema.</p>
          </div>

          <label className="field">
            <span className="field-label">Correo electrónico</span>
            <input
              type="email"
              placeholder="nombre@cibertec.edu.pe"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Contraseña</span>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
            />
          </label>

          <button type="submit">
            Ingresar
          </button>

          <p className="login-footnote">
            ¿Problemas para acceder? Contacta a soporte técnico.
          </p>

          {/* Créditos solicitados */}
          <p className="login-credit">
            by: <br />
            <span>Juan Pablo Mercado</span> <br />
            <span>Alejandro Fernández Rodríguez</span>
          </p>

        </form>
      </main>

    </div>
  );
}