import "../styles/feriados.css";
import React, { useState, useEffect } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { FaPlus } from "react-icons/fa";
import moment from "moment";
import { Calendar } from "primereact/calendar";
import { FloatLabel } from "primereact/floatlabel";
import api from "../utils/api";
import { ok, oops, deleteConfirmation } from "../utils/swal-alerts";

const Feriados = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [nombre, setNombre] = useState("");
  const [inicio, setInicio] = useState(new Date()); // Esto garantiza que inicio siempre es una fecha válida
  const [fin, setFin] = useState(new Date());
  const [idFeriado, setIdFeriado] = useState("");
  const [feriados, setFeriados] = useState([]);
  const [filtroInicio, setFiltroInicio] = useState("");
  const [filtroFin, setFiltroFin] = useState("");
  // Paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [itemsPorPagina] = useState(10);

  // useEffects
  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    getFeriados();
  }, [filtroInicio, filtroFin]);

  const getFeriados = async () => {
    const url = "feriado/filtered";

    const params = {
      inicio:
        moment(filtroInicio).format("YYYY-MM-DD") === "Invalid date"
          ? undefined
          : moment(filtroInicio).format("YYYY-MM-DD"),
      fin:
        moment(filtroFin).format("YYYY-MM-DD") === "Invalid date"
          ? undefined
          : moment(filtroFin).format("YYYY-MM-DD"),
    };

    try {
      const response = await api.get(url, { params });
      setFeriados(response.data);
    } catch (error) {
      setFeriados([]); // Limpia los datos si la petición falla
    }
  };

  const eliminarFeriado = async id => {
    const url = `feriado/${id}`;
    const isConfirmed = await deleteConfirmation();
    try {
      if (isConfirmed) {
        await api.delete(url);
        getFeriados();
        ok("Registro eliminado exitosamente.");
      }
    } catch (error) {
      oops("No se pudo eliminar el registro. Por favor inténtelo de nuevo.");
    }
  };

  const offset = paginaActual * itemsPorPagina;
  const currentPageData = feriados.slice(offset, offset + itemsPorPagina);
  const pageCount = Math.ceil(feriados.length / itemsPorPagina);

  const cargarFeriados = () => {
    return currentPageData.map(feriado => (
      <tr key={feriado.id} onClick={e => handleRowClick(e, feriado)}>
        <td>{feriado.nombre}</td>
        <td>{feriado.inicio}</td>
        <td>{feriado.fin}</td>
      </tr>
    ));
  };
  const handlePageClick = data => {
    setPaginaActual(data.selected);
  };

  const limpiar = () => {
    setNombre("");
    setInicio("");
    setFin("");
  };

  // Handlers
  const handleRowClick = (e, feriado) => {
    e.stopPropagation();
    setSelectedRow(feriado.id);
    setContextMenuPosition({ top: e.pageY, left: e.pageX });
    setShowContextMenu(true);
  };

  const handleDocumentClick = e => {
    if (!e.target.closest(".context-menu") && !e.target.closest("td")) {
      setSelectedRow(null);
      setShowContextMenu(false);
    }
  };

  const handleCloseModal = () => {
    limpiar();
    setShowModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const addOneDay = dateString => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);

    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  };

  const saveFeriado = async () => {
    try {
      const feriado = {
        nombre,
        inicio: moment(inicio).format("YYYY-MM-DD"),
        fin: moment(fin).format("YYYY-MM-DD"),
      };
      await api.post("feriado", feriado);
      ok("Registro guardado exitosamente.");
      getFeriados();
      handleCloseModal();
      limpiar();
    } catch (error) {
      oops("Error al conectar con el servidor.");
    }
  };

  const editFeriado = async () => {
    try {
      const feriado = {
        nombre,
        inicio: addOneDay(inicio),
        fin: addOneDay(fin),
      };
      await api.put(`feriado/${idFeriado}`, feriado);
      getFeriados();
      ok("Registro actualizado exitosamente.");
      handleCloseModal();
      limpiar();
    } catch (error) {
      if (error.response) {
        const { message } = error.response.data;
        if (message == "No existe el usuario") {
          oops(message);
        } else {
          oops("Error al conectar con el servidor.");
        }
      } else {
        oops("Error al conectar con el servidor.");
      }
    }
  };

  const nombreChange = e => {
    setNombre(e.target.value);
  };

  const inicioChange = e => {
    setInicio(e.target.value);
  };

  const finChange = e => {
    setFin(e.target.value); // Actualiza el estado tipo con el valor seleccionado
  };

  const handleFiltroInicio = e => {
    setFiltroInicio(e.target.value);
  };

  const handleFiltroFin = e => {
    setFiltroFin(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!isEditing) {
      saveFeriado();
    } else {
      editFeriado();
    }
  };

  const handleRefresh = () => {
    setFiltroInicio("");
    setFiltroFin("");
  };

  // Render
  return (
    <div className="feriados">
      <div className="mx-5">
        <div className="header">
          <h2>Feriados</h2>
        </div>
        <div className="row mb-0 mt-3 justify-content-between">
          <div className="col d-flex align-items-center">
            <label className="d-flex align-items-center fw-bold me-4">
              Filtros:
            </label>
            <div className="d-flex align-items-center">
              <label className="me-2">Desde:</label>
              <FloatLabel>
                <Calendar
                  inputId="filtroInicio"
                  value={filtroInicio}
                  onChange={handleFiltroInicio}
                  dateFormat="yy/mm/dd"
                  showButtonBar
                  showIcon
                />
                <label htmlFor="filtroInicio">yyyy/mm/dd</label>
              </FloatLabel>
            </div>
            <div className="d-flex align-items-center ms-4">
              <label className="me-2">Hasta:</label>
              <FloatLabel>
                <Calendar
                  inputId="filtroInicio"
                  value={filtroFin}
                  onChange={handleFiltroFin}
                  dateFormat="yy/mm/dd"
                  showButtonBar
                  showIcon
                  minDate={filtroInicio}
                />
                <label htmlFor="filtroInicio">yyyy/mm/dd</label>
              </FloatLabel>
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
              Nuevo feriado
            </button>
          </div>
        </div>
        <div className="mt-0">
          <table className="table table-bordered table-hover caption-top mt-3">
            <caption>Seleccione una fila para ver sus opciones</caption>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Inicio</th>
                <th>Fin</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.length === 0 ? (
                <tr>
                  <td colSpan="3">No hay resultados</td>
                </tr>
              ) : (
                cargarFeriados()
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
                const selectedFeriado = feriados.find(
                  feriado => feriado.id === selectedRow
                );
                if (selectedFeriado) {
                  setIdFeriado(selectedFeriado.id);
                  setNombre(selectedFeriado.nombre);
                  setInicio(selectedFeriado.inicio);
                  setFin(selectedFeriado.fin);
                  setShowContextMenu(false); // Cierra el menú contextual
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
              onClick={() => eliminarFeriado(selectedRow)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className="feriados-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {!isEditing ? "Crear Feriado" : "Editar Feriado"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row m-0 p-0">
              <Form.Group className="mb-3 col-12">
                <Form.Label className="fw-bold">Nombre:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el nombre del feriado"
                  maxLength="40"
                  value={nombre}
                  onChange={nombreChange}
                  required
                />
              </Form.Group>
              <div className="form-group mb-3 col-6">
                <label className="me-3 mt-3">Fecha de inicio:</label>
                <div className="mt-2 mx-0">
                  <Calendar
                    value={inicio}
                    onChange={inicioChange}
                    dateFormat="yy/mm/dd"
                    showButtonBar
                    showIcon
                  />
                </div>
              </div>
              <div className="form-group mb-3 col-6">
                <label className="me-3 mt-3">Fecha de fin:</label>
                <div className="mt-2 mx-0">
                  <Calendar
                    value={fin}
                    onChange={finChange}
                    minDate={inicio instanceof Date ? inicio : null}
                    dateFormat="yy/mm/dd"
                    showButtonBar
                    showIcon
                  />
                </div>
              </div>
            </div>
            <div className="container d-flex justify-content-center">
              <Button
                className="align-items-center"
                variant="primary"
                type="submit"
              >
                Guardar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Feriados;
