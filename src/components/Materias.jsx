import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import "../styles/materias.css";
import { FaPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { ok, oops, deleteConfirmation } from "../utils/swal-alerts";
import materiaService from "../services/materias.service";

const Materias = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [materias, setMaterias] = useState([]);
  const [formData, setFormData] = useState({ id: "", nombre: "", carrera: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [carreras] = useState([
    { nombre: "Ingeniería en Software" },
    { nombre: "Ingeniería Industrial" },
    { nombre: "Ingeniería en Telecomunicaciones" },
    { nombre: "Ingeniería en Tecnologías de la Información" },
    { nombre: "Ingeniería en Automatización y Robotica" },
  ]);
  const carreraRef = useRef(null);

  const [selectedCarrera, setSelectedCarrera] = useState("");

  const [paginaActual, setPaginaActual] = useState(0);
  const [itemsPorPagina] = useState(10);
  const offset = paginaActual * itemsPorPagina;
  const currentPageData = materias.slice(offset, offset + itemsPorPagina);
  const pageCount = Math.ceil(materias.length / itemsPorPagina);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    getMaterias();
  }, []);

  useEffect(() => {
    getMaterias();
  }, [filtroNombre, filtroCarrera]);

  const getMaterias = async () => {
    const params = {
      nombre: filtroNombre ? filtroNombre : undefined,
      carrera: filtroCarrera ? filtroCarrera : undefined,
    };
    await materiaService
      .getMateriasWithParams(params)
      .then(result => setMaterias(result))
      .catch(error => {
        oops(error);
        setMaterias([]);
      });
  };

  const guardarMateria = async () => {
    if (selectedCarrera === "") {
      carreraRef.current.focus();
      return;
    }

    const materia = {
      nombre: formData.nombre,
      carrera: selectedCarrera,
    };

    await materiaService
      .guardarMateria(materia)
      .then(() => {
        getMaterias();
        setFormData({ id: "", nombre: "", carrera: "" });
        setSelectedCarrera("");
        ok("Registro guardado exitosamente.");
      })
      .catch(error => {
        oops(error);
      });
  };

  const editarMateria = async () => {
    if (selectedCarrera === "") {
      carreraRef.current.focus();
      return;
    }
    const materia = {
      id: formData.id,
      nombre: formData.nombre,
      carrera: selectedCarrera,
    };

    await materiaService
      .editarMateria(materia)
      .then(() => {
        getMaterias();
        setIsEditing(false);
        setFormData({ id: "", nombre: "", carrera: "" });
        setSelectedCarrera("");
        ok("Registro actualizado exitosamente.");
      })
      .catch(error => {
        oops(error);
      });
  };

  const eliminarMateria = async id => {
    const confirmed = await deleteConfirmation();
    if (confirmed) {
      await materiaService
        .eliminarMateria(id)
        .then(() => {
          getMaterias();
          ok("Registro eliminado exitosamente.");
          setShowContextMenu(false);
        })
        .catch(error => oops(error));
    }
  };

  const cargarMaterias = () => {
    return currentPageData.map(materia => (
      <tr
        key={materia.id}
        className={materia.id === selectedRow ? "table-active" : ""}
        onClick={e => handleRowClick(e, materia)}
        style={{ cursor: "pointer" }}
      >
        <td>{materia.nombre}</td>
        <td>{materia.carrera}</td>
      </tr>
    ));
  };

  const limpiar = () => {
    setIsEditing(false);
    setFormData({ id: "", nombre: "", carrera: "" });
    setSelectedCarrera("");
  };

  const handleCloseModal = () => {
    limpiar();
    setShowModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleRowClick = (e, materia) => {
    e.stopPropagation();
    setSelectedRow(materia.id);
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

  const handleRefresh = () => {
    setFiltroNombre("");
    setFiltroCarrera("");
    getMaterias();
  };

  return (
    <>
      <div className="mx-5">
        <div className="header">
          <h2>Materias</h2>
        </div>
        <div className="row mb-0 mt-3 justify-content-between">
          <div className="col d-flex align-items-center">
            <label className="d-flex align-items-center fw-bold me-4">
              Filtros:
            </label>
            <div className="col-auto d-flex align-items-center">
              <label className="me-2">Nombre:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre"
                value={filtroNombre}
                onChange={e => setFiltroNombre(e.target.value)}
                maxLength={30}
              />
            </div>
            <div className="col-auto d-flex align-items-center ms-4">
              <label className="me-2">Carrera:</label>
              <select
                className="form-select"
                value={filtroCarrera}
                onChange={e => setFiltroCarrera(e.target.value)}
              >
                <option value="">Todas</option>
                {carreras.map(carrera => (
                  <option key={carrera.nombre} value={carrera.nombre}>
                    {carrera.nombre}
                  </option>
                ))}
              </select>
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
              Nueva Materia
            </button>
          </div>
        </div>

        <div className="mt-4">
          <table className="table table-bordered table-hover mt-4 caption-top">
            <caption>Seleccione una fila para ver sus opciones</caption>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Carrera</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.length === 0 ? (
                <tr>
                  <td colSpan="2">No hay resultados</td>
                </tr>
              ) : (
                cargarMaterias()
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
            id="context-menu"
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
                const selectedMateria = materias.find(
                  m => m.id === selectedRow
                );
                if (selectedMateria) {
                  setFormData({
                    id: selectedMateria.id,
                    nombre: selectedMateria.nombre,
                    carrera: selectedMateria.carrera,
                  });
                  setSelectedCarrera(selectedMateria.carrera);
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
              onClick={() => eliminarMateria(selectedRow)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {!isEditing ? "Crear Materia" : "Editar Materia"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="form-reservas">
            <div className="row">
              <div className="col-12">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="nombre">Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    id="nombre"
                    className="form-control"
                    name="nombre"
                    placeholder="Ingrese el nombre de la materia"
                    value={formData.nombre}
                    onChange={e =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="carrera">Carrera:</Form.Label>
                  <Form.Select
                    id="carrera"
                    className="form-control"
                    value={selectedCarrera}
                    ref={carreraRef}
                    onChange={e => setSelectedCarrera(e.target.value)}
                  >
                    <option value="">Seleccione una opción</option>
                    {carreras.map(carrera => (
                      <option key={carrera.nombre} value={carrera.nombre}>
                        {carrera.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="button-group mt-4 text-center">
              {!isEditing ? (
                <Button
                  type="button"
                  className="btn btn-custom"
                  onClick={() => guardarMateria()}
                >
                  Crear
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    className="btn btn-custom"
                    id="guardar-btn"
                    onClick={() => {
                      editarMateria(selectedRow);
                      handleCloseModal();
                    }}
                  >
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-danger ml-2"
                    onClick={() => {
                      limpiar;
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
    </>
  );
};

export default Materias;
