/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/login.css";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { oops } from "../utils/swal-alerts";

const Login = () => {
  // Variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const navigate = useNavigate();

  // Funciones
  const validarLogin = async e => {
    e.preventDefault();
    if (!username || !password) {
      setMensajeError("Completa todos los campos...");
    } else {
      const usuario = {
        username,
        password,
      };
      try {
        const resp = await api.post("usuario/login", usuario);
        if (resp.data) {
          setMensajeError("");
          localStorage.setItem("tipoUsuario", resp.data.tipo);
          localStorage.setItem("jwtToken", "tokenizado");
          navigate(`/fisei`);
        }
      } catch (error) {
        if (error.response) {
          const { message } = error.response.data;
          if (message == "Credenciales inválidas") {
            setMensajeError(message);
          } else {
            oops("Error al conectar con el servidor.");
          }
        } else {
          oops("Error al conectar con el servidor.");
        }
      }
    }
  };

  // Handlers
  const handleUsernameChange = e => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = e => {
    setPassword(e.target.value);
  };

  // Render
  return (
    <div className="container-fluid">
      <div className="login-container">
        <div className="login-form">
          <img
            src="/src/img/logo.png"
            alt="Logo de la Universidad Técnica de Ambato"
          />
          <h1>Bienvenido!</h1>
          <form onSubmit={validarLogin}>
            <div className="form-group">
              <label htmlFor="usuario">Usuario:</label>
              <input
                value={username}
                onChange={handleUsernameChange}
                type="text"
                className="form-control"
                id="usuario"
                placeholder="Ingrese su usuario"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña:</label>
              <input
                value={password}
                onChange={handlePasswordChange}
                type="password"
                className="form-control"
                id="password"
                placeholder="Ingrese su contraseña"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Iniciar sesión
            </button>
          </form>
          {mensajeError && (
            <p className="text-black mb-0 mt-2 fst-italic">{mensajeError}</p>
          )}
        </div>
      </div>
      <div className="right-panel">
        <h1>Universidad Técnica de Ambato</h1>
        <p>Innovación y Excelencia</p>
        <p>"Formando profesionales que transforman el mundo"</p>
      </div>
    </div>
  );
};

export default Login;
