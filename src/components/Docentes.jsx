import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Modal } from "react-bootstrap";
import "../styles/docentes.css";
import { FaPlus } from "react-icons/fa";
import {
  ok,
  oops,
  deleteConfirmation,
  info,
  warning,
} from "../utils/swal-alerts";
import ReactPaginate from "react-paginate";
import api from "../utils/api";
import { validarCedula } from "../utils/validaciones";

const Docentes = () => {
  // Variables
  const [selectedRow, setSelectedRow] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCedula, setFiltroCedula] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    cedula: "",
    apellido: "",
    telefono: "0999999999",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [itemsPorPagina] = useState(10);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    getDocentes();
  }, []);

  useEffect(() => {
    getDocentes();
  }, [filtroNombre, filtroCedula]);

  // Funciones
  const crearDocente = async () => {
    try {
      let docente = {
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        direccion: "",
        tipo: "Docente",
      };

      if (!validarCedula(docente.cedula)) {
        oops("Cédula inválida");
        return;
      }

      await api.post(`persona`, docente);
      getDocentes();
      setFormData({
        id: "",
        nombre: "",
        cedula: "",
        apellido: "",
        telefono: "",
      });
      handleCloseModal();
      ok("Registro guardado exitosamente.");
    } catch (error) {
      if (error.response) {
        const { message } = error.response.data;
        if (message == "cedula existe") {
          warning("La cédula ya existe");
        }
      } else {
        oops("No se pudo guardar el registro. Por favor, inténtelo de nuevo.");
      }
    }
  };

  const getDocentes = async () => {
    const params = {
      cedula: filtroCedula ? filtroCedula : undefined,
      nombre: filtroNombre ? filtroNombre : undefined,
    };
    try {
      const response = await api.get("persona/docente/filtered", { params });
      setDocentes(response.data);
      if (!docentes) {
        info("No hay docentes");
      }
    } catch (error) {
      oops("No se pudo cargar los docentes. Por favor, inténtelo de nuevo.");
      setDocentes([]); // Limpia los datos si la petición falla
    }
  };

  const limpiar = async () => {
    setIsEditing(false);
    setFormData({ id: "", nombre: "", cedula: "", apellido: "", telefono: "" });
  };

  const eliminarDocentes = async id => {
    const url = `persona/${id}`;
    const isConfirmed = await deleteConfirmation();
    try {
      if (isConfirmed) {
        await api.delete(url);
        getDocentes();
        ok("Registro eliminado exitosamente.");
      }
    } catch (error) {
      oops(
        "No se pudo eliminar el registro. Es posible que este asociado a un horario."
      );
    }
  };

  const editarDocente = async () => {
    const url = `persona`;
    let docente = {
      id: formData.id,
      cedula: "editando",
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      direccion: "",
      tipo: "Docente",
    };
    try {
      const response = await api.post(url, docente);
      if (response.status === 200) {
        getDocentes();
        setIsEditing(false);
        setFormData({
          id: "",
          nombre: "",
          cedula: "",
          apellido: "",
          telefono: "",
        });
        ok("Registro actualizado exitosamente.");
        handleCloseModal();
      }
    } catch (error) {
      if (error.response) {
        const { message } = error.response.data;
        if (message == "cedula existe") {
          warning("La cédula ya existe");
        }
      } else {
        oops(
          "No se pudo actualizar el registro. Por favor, inténtelo de nuevo."
        );
      }
    }
  };

  const handleRowClick = (e, docente) => {
    e.stopPropagation();
    setSelectedRow(docente.id);
    setContextMenuPosition({ top: e.pageY, left: e.pageX });
    setShowContextMenu(true);
  };

  const handleDocumentClick = e => {
    if (!e.target.closest(".context-menu") && !e.target.closest("td")) {
      setSelectedRow(null);
      setShowContextMenu(false);
    }
  };

  const handlePageClick = data => {
    setPaginaActual(data.selected);
  };
  const handleCloseModal = () => {
    limpiar();
    setShowModal(false);
  };
  const handleShowModal = () => {
    setShowModal(true);
  };

  const offset = paginaActual * itemsPorPagina;
  const currentPageData = docentes.slice(offset, offset + itemsPorPagina);
  const pageCount = Math.ceil(docentes.length / itemsPorPagina);

  const cargarDocentes = () => {
    return currentPageData.map(docente => (
      <tr
        key={docente.id}
        className={docente.id === selectedRow ? "table-active" : ""}
        onClick={e => handleRowClick(e, docente)}
        style={{ cursor: "pointer" }}
      >
        <td>{docente.cedula}</td>
        <td>
          {docente.apellido} {docente.nombre}
        </td>
      </tr>
    ));
  };

  const handleRefresh = () => {
    setFiltroCedula("");
    setFiltroNombre("");
  };

  const handleFiltroCedulaChange = e => {
    const value = e.target.value;
    const filteredValue = value.replace(/\D/g, "");
    setFiltroCedula(filteredValue);
  };

  return (
    <div className="mx-5">
      <div className="header">
        <h2>Docentes</h2>
      </div>
      <div className="container-sm pe-5 ps-5">
        <div className="row mb-0 mt-3 justify-content-between">
          <div className="col d-flex align-items-center">
            <label className="d-flex align-items-center fw-bold me-4">
              Filtros:
            </label>
            <div className="col-auto d-flex align-items-center">
              <label className="me-2">Cédula:</label>
              <input
                type="tel"
                className="form-control"
                placeholder="Cédula"
                value={filtroCedula}
                onChange={handleFiltroCedulaChange}
                maxLength={10}
              />
            </div>
            <div className="col-auto d-flex align-items-center ms-4">
              <label className="me-2">Nombre:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre o apellido"
                value={filtroNombre}
                onChange={e => setFiltroNombre(e.target.value)}
                maxLength={30}
              />
            </div>
            <div className="col-auto d-flex align-items-center ms-4">
              <button className="btn" onClick={handleRefresh}>
                <i className="fas fa-refresh"></i>
              </button>
            </div>
          </div>
          <div className="col-auto">
            <button
              className="btn"
              onClick={() => {
                setIsEditing(false);
                handleShowModal();
              }}
            >
              <FaPlus style={{ marginRight: "5px" }} />
              Nuevo Docente
            </button>
          </div>
        </div>
        <div className="mt-4">
          <table className="table table-bordered table-hover table-sm caption-top">
            <caption>Seleccione una fila para ver sus opciones</caption>
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Cédula</th>
                <th style={{ width: "80%" }}>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.length === 0 ? (
                <tr>
                  <td colSpan="3">No hay resultados</td>
                </tr>
              ) : (
                cargarDocentes()
              )}
            </tbody>
          </table>
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousClassName={"page-item"}
            previousLinkClassName={"page-link"}
            nextClassName={"page-item"}
            nextLinkClassName={"page-link"}
            breakClassName={"page-item"}
            breakLinkClassName={"page-link"}
          />
          <div
            className="context-menu"
            style={{
              display:
                showContextMenu && selectedRow !== null ? "block" : "none",
              top: contextMenuPosition.top,
              left: contextMenuPosition.left,
            }}
          >
            <Button
              variant="custom"
              id="editar-btn"
              onClick={() => {
                const selectedDocente = docentes.find(
                  d => d.id === selectedRow
                );
                if (selectedDocente) {
                  setFormData({
                    id: selectedDocente.id,
                    cedula: selectedDocente.cedula,
                    nombre: selectedDocente.nombre,
                    apellido: selectedDocente.apellido,
                    telefono: selectedDocente.telefono,
                  });
                  setShowContextMenu(false);
                  setIsEditing(true);
                  handleShowModal();
                }
              }}
            >
              Editar
            </Button>
            <Button
              variant="custom"
              id="eliminar-btn"
              onClick={() => eliminarDocentes(selectedRow)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {!isEditing ? "Crear Docente" : "Editar Docente"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="form-reservas">
            <div className="row">
              <div className="col-12">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="cedula">Cédula:</Form.Label>
                  {!isEditing ? (
                    <Form.Control
                      type="text"
                      id="cedula"
                      className="form-control"
                      name="cedula"
                      value={formData.cedula}
                      maxLength={10}
                      placeholder="Ingrese su cédula"
                      onChange={e => {
                        // Acepta solo valores numéricos
                        const re = /^[0-9\b]+$/;
                        if (e.target.value === "" || re.test(e.target.value)) {
                          setFormData({ ...formData, cedula: e.target.value });
                        }
                      }}
                    />
                  ) : (
                    <Form.Control
                      type="text"
                      id="cedula"
                      className="form-control"
                      name="cedula"
                      value={formData.cedula}
                      maxLength={10}
                      placeholder="Ingrese su cédula"
                      onChange={e => {
                        // Acepta solo valores numéricos
                        const re = /^[0-9\b]+$/;
                        if (e.target.value === "" || re.test(e.target.value)) {
                          setFormData({ ...formData, cedula: e.target.value });
                        }
                      }}
                      readOnly
                    />
                  )}
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="nombre">Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    id="nombre"
                    className="form-control"
                    name="nombre"
                    value={formData.nombre}
                    placeholder="Ingrese su nombre"
                    onChange={e =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="apellido">Apellido:</Form.Label>
                  <Form.Control
                    type="text"
                    id="apellido"
                    className="form-control"
                    name="apellido"
                    value={formData.apellido}
                    placeholder="Ingrese su apellido"
                    onChange={e =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
            </div>
            <div className="button-group mt-4 text-center">
              {!isEditing ? (
                <Button
                  type="button"
                  className="btn btn-custom"
                  onClick={() => {
                    crearDocente();
                  }}
                >
                  Crear
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    className="btn btn-custom"
                    id="guardar-btn"
                    onClick={editarDocente}
                  >
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-danger ml-2"
                    onClick={() => {
                      limpiar();
                      handleCloseModal();
                    }}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Docentes;
