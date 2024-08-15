import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Alert, Modal } from "react-bootstrap";
import "../styles/AulaLabs.css";
import ReactPaginate from "react-paginate";
import { FaPlus } from "react-icons/fa";
import { ok, oops, deleteConfirmation, info } from "../utils/swal-alerts";
import api from "../utils/api";

const Espacios = () => {
  // Variables
  const [selectedRow, setSelectedRow] = useState(null);
  const [bloques, setBloques] = useState([]);
  const [selectedBloque, setSelectedBloque] = useState("1");
  const [selectedTipo, setSelectedTipo] = useState("Aula");
  const [aulas, setAulas] = useState([]);
  const [nombreError, setNombreError] = useState("");
  const [capacidadError, setCapacidadError] = useState("");
  const [filtroBloque, setFiltroBloque] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [aulasLabsToShow, setAulasLabsToShow] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    id_bloque: "1",
    tipo: "Aula",
    piso: "1",
    nombre: "",
    capacidad: "",
    id: "",
  });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [isEditing, setIsEditing] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [itemsPorPagina] = useState(10);

  // useEffects
  useEffect(() => {
    getBloques();
    fetchAulasLabs();
  }, []);

  useEffect(() => {
    fetchAulasLabs();
  }, [filtroBloque, filtroNombre, filtroTipo]);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    setAulasLabsToShow([...aulas]);
  }, [aulas]);

  // Funciones
  const getBloques = async () => {
    try {
      const response = await api.get("bloque");
      setBloques(response.data);
    } catch (error) {
      oops("Error al cargar bloques.");
    }
  };

  const crearEspacio = async () => {
    try {
      let espacio = {
        id_bloque: selectedBloque,
        tipo: selectedTipo,
        piso: formData.piso,
        nombre: formData.nombre,
        capacidad: formData.capacidad,
      };
      if (espacio.nombre === "") {
        setNombreError("Ingrese un nombre");
        return;
      }
      if (espacio.capacidad === "") {
        setCapacidadError("Ingrese la capacidad");
        return;
      }
      await api.post("espacio", espacio);
      fetchAulasLabs();
      ok("Registro guardado exitosamente.");
      limpiar();
    } catch (error) {
      oops("No se pudo guardar el registro. Por favor, inténtelo de nuevo.");
    }
    handleCloseModal();
  };

  const limpiar = async () => {
    setIsEditing(false);
    setFormData({ nombre: "", capacidad: "", id: "" });
  };

  const editarespacio = async () => {
    let espacio = {
      id_bloque: selectedBloque,
      tipo: selectedTipo,
      piso: formData.piso,
      nombre: formData.nombre,
      capacidad: formData.capacidad,
    };

    try {
      const response = await api.put(`espacio/${formData.id}`, espacio);
      if (response.status === 200) {
        fetchAulasLabs();
        setIsEditing(false);
        setFormData({ nombre: "", capacidad: "", id: "", piso: "1" });
        ok("Registro actualizado exitosamente.");
      }
    } catch (error) {
      oops("No se pudo actualizar el registro. Por favor, inténtelo de nuevo.");
    }
    handleCloseModal();
  };

  const eliminarEspacio = async () => {
    if (selectedRow) {
      // Asegúrate de que hay un ID seleccionado
      const url = `espacio/${selectedRow}`; // Uso correcto del ID seleccionado

      const isConfirmed = await deleteConfirmation();
      try {
        if (isConfirmed) {
          await api.delete(url);
          fetchAulasLabs();
          ok("Registro eliminado exitosamente.");
        }
      } catch (error) {
        oops(
          "No se pudo eliminar el registro. Es posible que este asociado a un horario u reserva."
        );
      }
    }
  };

  const fetchAulasLabs = async () => {
    const params = {
      nombre: filtroNombre.trim() ? filtroNombre.trim() : undefined,
      tipo: filtroTipo ? filtroTipo : undefined,
      id_bloque: filtroBloque ? filtroBloque : undefined,
    };

    try {
      const response = await api.get("espacio/filtered", { params });
      if (!response.data) {
        info("No hay coincidencias");
      } else {
        setAulas(response.data);
      }
    } catch (error) {
      oops("No se pudo cargar los espacios. Por favor, inténtelo de nuevo.");
      setAulas([]);
    }
  };

  const handlePageClick = data => {
    setPaginaActual(data.selected);
  };

  const offset = paginaActual * itemsPorPagina;
  const currentPageData = aulas.slice(offset, offset + itemsPorPagina);
  const pageCount = Math.ceil(aulas.length / itemsPorPagina);

  const handleRowClick = (e, aula) => {
    e.stopPropagation();
    setSelectedRow(aula.id);
    setContextMenuPosition({ top: e.pageY, left: e.pageX });
    setShowContextMenu(true);
  };

  const handleEditClick = () => {
    const selectedAulaLab = aulasLabsToShow.find(d => d.id === selectedRow);

    if (selectedAulaLab) {
      setFormData({
        id_bloque: selectedAulaLab.id_bloque,
        tipo: selectedAulaLab.tipo,
        piso: selectedAulaLab.piso,
        nombre: selectedAulaLab.nombre,
        capacidad: selectedAulaLab.capacidad,
        id: selectedAulaLab.id,
      });
      setSelectedBloque(selectedAulaLab.id_bloque);
      setSelectedTipo(selectedAulaLab.tipo);
      setIsEditing(true);
      setShowContextMenu(false);
    }
  };

  const handleDocumentClick = e => {
    if (!e.target.closest(".context-menu") && !e.target.closest("td")) {
      setSelectedRow(null);
      setShowContextMenu(false);
    }
  };

  const cargarTabla = () => {
    return aulas.slice(offset, offset + itemsPorPagina).map(aula => (
      <tr key={aula.id} onClick={e => handleRowClick(e, aula)}>
        <td>{aula.nombre}</td>
        <td>{aula.piso}</td>
        <td>{aula.capacidad}</td>
        <td>{bloques.find(b => b.id === aula.id_bloque)?.nombre}</td>
        <td>{aula.tipo}</td>
      </tr>
    ));
  };

  const handleRefresh = () => {
    setFiltroNombre("");
    setFiltroBloque("");
    setFiltroTipo("");
  };

  const handleCloseModal = () => {
    limpiar();
    setShowModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  return (
    <div className="mx-5">
      <div className="header">
        <h2>Espacios</h2>
      </div>
      <div className="row mb-0 mt-1 ">
        <div className="col d-flex align-items-center ">
          <label className="d-flex align-items-center fw-bold me-4">
            Filtros:
          </label>
          <div className="col-auto d-flex align-items-center">
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
            <label className="me-2">Tipo:</label>
            <select
              className="form-select"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Laboratorio">Laboratorio</option>
              <option value="Aula">Aula</option>
              <option value="Especial">Especial</option>
            </select>
          </div>
          <div className="col-auto d-flex align-items-center ms-4">
            <label className="me-2">Bloque:</label>
            <select
              className="form-select"
              value={filtroBloque}
              onChange={e => setFiltroBloque(e.target.value)}
            >
              <option value="">Todos</option>
              {bloques.map(bloque => (
                <option key={bloque.id} value={bloque.id}>
                  {bloque.nombre}
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
            Nuevo Espacio
          </button>
        </div>
      </div>
      <div className="mt-1">
        <table className="table table-bordered table-hover mt-4 caption-top">
          <caption>Seleccione una fila para ver sus opciones</caption>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Piso</th>
              <th>Capacidad</th>
              <th>Bloque</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.length === 0 ? (
              <tr>
                <td colSpan="5">No hay resultados</td>
              </tr>
            ) : (
              cargarTabla()
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
            display: showContextMenu && selectedRow !== null ? "block" : "none",
            top: contextMenuPosition.top,
            left: contextMenuPosition.left,
          }}
        >
          <Button
            variant="custom"
            id="editar-btn"
            onClick={() => {
              handleEditClick();
              handleShowModal();
            }}
          >
            Editar
          </Button>
          <Button
            variant="custom"
            id="eliminar-btn"
            onClick={() => eliminarEspacio()}
          >
            Eliminar
          </Button>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {!isEditing ? "Crear Espacio" : "Editar Espacio"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="form-reservas">
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="bloque">Bloque:</Form.Label>
                  <Form.Select
                    id="bloque"
                    className="form-control"
                    value={selectedBloque}
                    onChange={e => setSelectedBloque(e.target.value)}
                  >
                    {bloques.map(bloque => (
                      <option key={bloque.id} value={bloque.id}>
                        {bloque.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="tipo">Tipo:</Form.Label>
                  <Form.Select
                    id="tipo"
                    className="form-control"
                    value={selectedTipo}
                    onChange={e => setSelectedTipo(e.target.value)}
                  >
                    <option value="Aula">Aula</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Especial">Especial</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="piso">Piso:</Form.Label>
                  <Form.Select
                    id="piso"
                    className="form-control"
                    name="piso"
                    value={formData.piso}
                    onChange={e =>
                      setFormData({ ...formData, piso: e.target.value })
                    }
                  >
                    <option value="1">Piso 1</option>
                    <option value="2">Piso 2</option>
                    <option value="3">Piso 3</option>
                    <option value="4">Piso 4</option>
                    <option value="5">Piso 5</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="capacidad">Capacidad:</Form.Label>
                  <Form.Control
                    type="number"
                    id="capacidad"
                    className="form-control"
                    name="capacidad"
                    min="1"
                    max="100"
                    value={formData.capacidad}
                    onChange={e => {
                      setFormData({ ...formData, capacidad: e.target.value });
                      setCapacidadError("");
                    }}
                  />
                  {capacidadError && (
                    <Alert variant="danger">{capacidadError}</Alert>
                  )}
                </Form.Group>
              </div>

              <div className="col-md-12">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="nombre">Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    id="nombre"
                    className="form-control"
                    name="nombre"
                    value={formData.nombre}
                    onChange={e => {
                      setFormData({ ...formData, nombre: e.target.value });
                      setNombreError("");
                    }}
                  />
                  {nombreError && <Alert variant="danger">{nombreError}</Alert>}
                </Form.Group>
              </div>
            </div>
            <div className="button-group mt-4 text-center">
              {!isEditing ? (
                <Button
                  type="button"
                  className="btn btn-custom"
                  onClick={crearEspacio}
                >
                  Crear
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    className="btn btn-custom"
                    id="guardar-btn"
                    onClick={() => editarespacio()}
                  >
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-danger ml-2"
                    onClick={limpiar}
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

export default Espacios;
