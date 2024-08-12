import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Form, Modal } from "react-bootstrap";
import Select from "react-select";
import "../styles/horario.css";
import { ok, oops, deleteConfirmation } from "../utils/swal-alerts";
import api from "../utils/api";

const Horarios = () => {
  // Variables
  const [bloques, setBloques] = useState([]);
  const [docentes, setDocente] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedBloque, setSelectedBloque] = useState(1);
  const [aulasLabs, setAulasLabs] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState("Aula");
  const [selectedAulaLab, setSelectedAulaLab] = useState("");
  const [selectedHora, setSelectedHora] = useState("7-8");
  const [selectedDia, setSelectedDia] = useState("Lunes");
  const [selectedMateria, setSelectedMateria] = useState();
  const [selectedDocente, setSelectedDocente] = useState("");
  const [selectedHorario, setSelectedHorario] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showContextCrear, setShowContextCrear] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const horas = [
    "7-8",
    "8-9",
    "9-10",
    "10-11",
    "11-12",
    "12-13",
    "13-14",
    "14-15",
    "15-16",
    "16-17",
    "17-18",
    "18-19",
    "19-20",
  ];

  const horas2 = [
    "7-8",
    "8-9",
    "9-10",
    "10-11",
    "11-12",
    "12-13",
    "14-15",
    "15-16",
    "16-17",
    "17-18",
    "18-19",
    "19-20",
  ];
  const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
  const [showModal, setShowModal] = useState(false);

  const formatHora = hora => {
    const [start, end] = hora.split("-");
    const startFormatted = `${start.padStart(2, "0")}:00`;
    const endFormatted = `${end.padStart(2, "0")}:00`;
    return `${startFormatted} - ${endFormatted}`;
  };
  const [noHorariosMessage, setNoHorariosMessage] = useState("");

  // useEffects
  useEffect(() => {
    getDocentes();
  }, []);

  useEffect(() => {
    getMaterias();
    getBloques();
  }, []);

  useEffect(() => {
    if (selectedBloque && selectedTipo) {
      fetchAulasLabs();
    }
  }, [selectedBloque, selectedTipo]);

  useEffect(() => {
    if (selectedAulaLab) {
      getHorarios();
    }
  }, [selectedAulaLab]);

  useEffect(() => {
    if (aulasLabs.length > 0) {
      setSelectedAulaLab(aulasLabs[0].id);
    }
  }, [aulasLabs]);

  useEffect(() => {
    if (materias.length > 0 && !selectedMateria) {
      setSelectedMateria(materias[0].id);
    }
  }, [materias]);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  // Funciones
  const handleCloseModal = () => {
    //limpiar los datos
    setSelectedHora("7-8");
    setSelectedDia("Lunes");
    setSelectedMateria("");
    setSelectedDocente("");
    setIsEditing(false);

    setShowModal(false);
  };
  const handleShowModal = () => {
    setShowModal(true);
  };
  const fetchAulasLabs = async () => {
    const url = `espacio/bloque/${selectedBloque}`;

    try {
      const response = await api.get(url);
      let filteredData = [];
      if (selectedTipo == "Aula") {
        filteredData = response.data.filter(item => item.tipo === "Aula");
      } else if (selectedTipo == "Laboratorio") {
        filteredData = response.data.filter(
          item => item.tipo === "Laboratorio"
        );
      } else if (selectedTipo == "Especial") {
        filteredData = response.data.filter(item => item.tipo === "Especial");
      }
      setAulasLabs(filteredData);
      if (filteredData.length === 0) {
        setNoHorariosMessage(
          "No hay espacios disponibles para esta selección."
        );
      } else {
        setNoHorariosMessage("");
      }
    } catch (error) {
      const { message } = error.response.data;
      if (message === "No hay espacios en este bloque") {
        oops(message);
      } else {
        oops("Error al cargar espacios");
      }
      setAulasLabs([]); // Limpia los datos si la petición falla
      setNoHorariosMessage(
        "No hay aulas, laboratorios o espacios especiales disponibles."
      );
    }
  };

  const getHorarios = async () => {
    const url =
      selectedTipo === "Laboratorio"
        ? `horario/lab/${selectedAulaLab}`
        : `horario/aula/${selectedAulaLab}`;
    try {
      const response = await api.get(url);
      setHorarios(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      oops("Error al cargar horarios.");
      setHorarios([]); // Limpia los datos si la petición falla
    }
  };

  const carreras = {
    "Ingeniería en Software": "SW",
    "Ingeniería Industrial": "II",
    "Ingeniería en Telecomunicaciones": "IT",
    "Ingeniería en Tecnologías de la Información": "TI",
    "Ingeniería en Automatización y Robotica": "RA",
  };

  const getMaterias = async () => {
    const url = "materia";
    try {
      const respuesta = await api.get(url);
      const materiasopciones = respuesta.data.map(materia => ({
        value: materia.id,
        label: carreras[materia.carrera]
          ? `${materia.nombre} - ${carreras[materia.carrera]}`
          : `${materia.nombre} - ${materia.carrera}`,
      }));

      setMaterias(materiasopciones);
    } catch (error) {
      oops("Error al cargar materias.");
      setMaterias([]);
    }
  };

  const eliminarHorario = async id => {
    const url = `horario/${id}`;
    const isConfirmed = await deleteConfirmation();
    try {
      if (isConfirmed) {
        await api.delete(url);
        getHorarios();
        ok("Registro eliminado exitosamente.");
      }
    } catch (error) {
      oops("No se pudo eliminar el registro. Por favor, inténtelo de nuevo.");
    }
  };

  const getDocentes = async () => {
    const url = `persona/docente/filtered`;
    try {
      const response = await api.get(url);
      const docentesOptions = response.data.map(docente => ({
        value: docente.id,
        label: `${docente.nombre} ${docente.apellido}`,
      }));
      setDocente(docentesOptions);
    } catch (error) {
      oops("Error al cargar docentes.");
      setDocente([]);
    }
  };

  const getBloques = async () => {
    try {
      const resp = await api.get("bloque");
      setBloques(resp.data);
    } catch (error) {
      oops("Error al cargar bloques.");
    }
  };

  const renderTableCell = (dia, hora) => {
    if (hora === "13-14") {
      return <td style={{ backgroundColor: "#ffcccb" }}>Receso</td>;
    }

    const horaInicio = hora.split("-")[0];
    const horario = horarios.find(h => h.dia === dia && h.hora === horaInicio);

    if (horario) {
      const [materia, profesor] = horario.nombre.split(" - ");
      return (
        <>
          {materia} - <strong>{profesor}</strong>
        </>
      );
    }

    return "";
  };

  // Handlers
  const handleDocumentClick = e => {
    if (!e.target.closest(".context-menu") && !e.target.closest("td")) {
      setSelectedCell(null);
      setShowContextMenu(false);
      setShowContextCrear(false);
    }
  };
  const handleMateriaChange = selectedOption => {
    setSelectedMateria(selectedOption);
  };

  const handleDocenteChange = selectedOption => {
    setSelectedDocente(selectedOption);
  };

  const handleBloqueChange = event => {
    setSelectedBloque(event.target.value);
  };

  const handleTipoChange = event => {
    setSelectedTipo(event.target.value);
  };

  const handleAulaLabChange = event => {
    setSelectedAulaLab(event.target.value);
  };

  const handleDeleteClick = () => {
    if (selectedCell) {
      const diaIndex = (selectedCell.cellIndex - 1 + 1) % dias.length;

      const horario = horarios.find(
        h =>
          h.dia === dias[diaIndex] &&
          h.hora.startsWith(selectedCell.rowIndex + 7 + "")
      );

      if (horario) {
        eliminarHorario(horario.id);
      }
    }
  };

  const handleCreateHorario = async () => {
    const horarioExiste = horarios.some(
      horario =>
        horario.dia === selectedDia &&
        horario.hora === selectedHora.split("-")[0]
    );
    const nada = selectedDocente.value;

    const url = "horario";
    const nuevoHorario = {
      dia: selectedDia,
      hora: selectedHora.split("-")[0],
      id_materia: selectedMateria.value,
      id_persona: nada,
      id_espacio: selectedAulaLab,
    };

    try {
      if (horarioExiste) {
        oops("Ya existe un horario en el mismo día y hora");
        return;
      }

      await api.post(url, nuevoHorario);

      ok("Registro guardado exitosamente.");

      getHorarios();
      handleCancelEdit();
    } catch (error) {
      oops("No se pudo guardar el registro. Por favor, inténtelo de nuevo.");
      console.log(nuevoHorario);
    }
  };

  const handleSaveChanges = async () => {
    const horarioExiste = horarios.some(
      horario =>
        horario.dia === selectedDia &&
        horario.hora === selectedHora.split("-")[0] &&
        horario.id !== selectedHorario
    );

    if (horarioExiste) {
      oops("Ya existe un horario en el mismo día y hora");
      return;
    }

    const url = `horario`;

    const nada = selectedDocente.value;
    const materia = selectedMateria.value;
    const horarioActualizado = {
      id: selectedHorario,
      dia: selectedDia,
      hora: selectedHora.split("-")[0],
      id_materia: materia,
      id_persona: nada,
      id_espacio: selectedAulaLab,
    };
    console.log(horarioActualizado);

    try {
      const response = await api.post(url, horarioActualizado, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        getHorarios();
        handleCancelEdit();
        setIsEditing(false);
        setSelectedCell(null);
        ok("Registro actualizado exitosamente.");
      }
    } catch (error) {
      oops("No se pudo actualizar el registro. Por favor, inténtelo de nuevo.");
    }
  };

  const handleEditClick = () => {
    if (selectedCell) {
      const diaIndex = (selectedCell.cellIndex - 1 + 1) % dias.length;

      const horario = horarios.find(
        h =>
          h.dia === dias[diaIndex] &&
          h.hora.startsWith(selectedCell.rowIndex + 7 + "")
      );

      if (horario) {
        setSelectedDia(horario.dia);
        setSelectedHora(horario.hora + "-" + (parseInt(horario.hora) + 1)); // Ajuste para establecer la hora correctamente
        const materia = materias.find(d => d.value === horario.id_materia);
        setSelectedMateria(materia);
        const docente = docentes.find(d => d.value === horario.id_persona);
        setSelectedDocente(docente);
        setSelectedAulaLab(horario.id_espacio);
        setSelectedHorario(horario.id); // Establece el ID del horario para la edición
        setIsEditing(true);
        handleShowModal();
      }
      setShowContextMenu(false);
    }
    setShowContextMenu(false);
  };

  const handleCancelEdit = () => {
    setSelectedHora("7-8");
    setSelectedDia("Lunes");
    setSelectedMateria("");
    setSelectedDocente("");
    setIsEditing(false);
    setShowContextMenu(false);
    handleCloseModal();
  };

  const handleCellClick = (e, rowIndex, cellIndex) => {
    const celdaSeleccionada = { rowIndex, cellIndex };
    setSelectedCell(celdaSeleccionada);
    setContextMenuPosition({ top: e.pageY, left: e.pageX });

    const diaIndex = cellIndex;

    const horario = horarios.find(
      h => h.dia === dias[diaIndex] && h.hora.startsWith(rowIndex + 7 + "")
    );

    if (horario) {
      // Contextual para editar y eliminar
      setShowContextMenu(true);
      setShowContextCrear(false);
    } else {
      // Contextual para crear
      //Logica para que se selecciona automaticamente el dia y la hora en los combos
      //de acuerdo a lo seleccionado
      seleccionDiaHora(celdaSeleccionada);
      setShowContextCrear(true);
      setShowContextMenu(false);
    }
  };

  const seleccionDiaHora = celdaSeleccionada => {
    //logica para utilizar los set de dia y hora
    let dia = "";
    switch (celdaSeleccionada.cellIndex) {
      case 0:
        dia = "Lunes";
        break;
      case 1:
        dia = "Martes";
        break;
      case 2:
        dia = "Miercoles";
        break;
      case 3:
        dia = "Jueves";
        break;
      case 4:
        dia = "Viernes";
        break;
      case 5:
        dia = "Sabado";
        break;
    }
    setSelectedDia(dia);

    let hora = "";
    const fila = celdaSeleccionada.rowIndex;
    hora = parseInt(fila) + 7 + "-" + (parseInt(fila) + 8);
    setSelectedHora(hora);
  };

  // Render
  return (
    <div className="horario">
      <div className="mx-5">
        <div className="header text-center">
          <h2>Horarios</h2>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Form id="form-horarios">
              <div className="form-container">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="bloque">Bloque:</Form.Label>
                  <Form.Select
                    id="bloque"
                    className="form-control"
                    value={selectedBloque}
                    onChange={handleBloqueChange}
                  >
                    {bloques.map(bloque => (
                      <option key={bloque.id} value={bloque.id}>
                        {bloque.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="form-group col-md-6">
                  <Form.Label htmlFor="aula">Tipo:</Form.Label>
                  <Form.Select
                    id="aula"
                    className="form-control"
                    value={selectedTipo}
                    onChange={handleTipoChange}
                    name="aula"
                  >
                    <option value="Aula">Aulas</option>
                    <option value="Laboratorio">Laboratorios</option>
                    <option value="Especial">Especial</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="form-group">
                  <Form.Label>
                    Espacio:{" "}
                    {aulasLabs.length === 0 && (
                      <label>(No hay espacios disponibles)</label>
                    )}
                  </Form.Label>
                  <Form.Select
                    id="aula-lab"
                    className="form-control"
                    value={selectedAulaLab}
                    onChange={handleAulaLabChange}
                    disabled={aulasLabs.length === 0}
                    name="aulaLab"
                  >
                    {aulasLabs.map(aulaLab => (
                      <option key={aulaLab.id} value={aulaLab.id}>
                        {aulaLab.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </Form>

            {noHorariosMessage ? (
              <div
                className="alert alert-info text-center mt-3 no-horarios-message"
                role="alert"
              >
                {noHorariosMessage}
              </div>
            ) : (
              <table className="table table-bordered mt-3 table-centered caption-top">
                <caption>Seleccione una celda para realizar una acción</caption>
                <thead>
                  <tr>
                    <th>Horas</th>
                    <th>Lunes</th>
                    <th>Martes</th>
                    <th>Miércoles</th>
                    <th>Jueves</th>
                    <th>Viernes</th>
                  </tr>
                </thead>
                <tbody>
                  {horas.map((hora, rowIndex) => (
                    <tr key={hora}>
                      <td
                        style={
                          hora === "13-14"
                            ? {
                                backgroundColor: "#ffcccb",
                                textAlign: "center",
                              }
                            : {}
                        }
                      >
                        {formatHora(hora)}
                      </td>
                      {dias.map((dia, cellIndex) => (
                        <td
                          key={`${dia}-${hora}`}
                          style={
                            hora === "13-14"
                              ? {
                                  backgroundColor: "#ffcccb",
                                  textAlign: "center",
                                }
                              : {}
                          }
                          onClick={e =>
                            hora !== "13-14" &&
                            handleCellClick(e, rowIndex, cellIndex)
                          }
                          className={
                            selectedCell &&
                            selectedCell.rowIndex === rowIndex &&
                            selectedCell.cellIndex === cellIndex
                              ? "selected"
                              : ""
                          }
                        >
                          {hora === "13-14"
                            ? "Receso"
                            : renderTableCell(dia, hora)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div
              className="context-menu"
              id="context-menu"
              style={{
                display: showContextMenu ? "block" : "none",
                top: contextMenuPosition.top,
                left: contextMenuPosition.left,
              }}
            >
              <Button
                variant="custom"
                id="editar-btn"
                onClick={handleEditClick}
              >
                Editar
              </Button>
              <Button
                variant="custom"
                id="eliminar-btn"
                onClick={handleDeleteClick}
              >
                Eliminar
              </Button>
            </div>
            <div
              className="context-menu"
              id="context-menu"
              style={{
                display: showContextCrear ? "block" : "none",
                top: contextMenuPosition.top,
                left: contextMenuPosition.left,
              }}
            >
              <Button
                variant="custom"
                id="editar-btn"
                onClick={handleShowModal}
              >
                Crear
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {!isEditing ? "Crear Horario" : "Editar Horario"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/*Aqui va todo lo que se utilizo para crear */}
          <Form id="form-horario">
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="dia">Día:</Form.Label>
                  <Form.Select
                    id="dia"
                    className="form-control"
                    value={selectedDia}
                    onChange={e => setSelectedDia(e.target.value)}
                  >
                    <option>Lunes</option>
                    <option>Martes</option>
                    <option>Miercoles</option>
                    <option>Jueves</option>
                    <option>Viernes</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="hora">Hora:</Form.Label>
                  <Form.Select
                    id="hora"
                    className="form-control"
                    value={selectedHora}
                    onChange={e => setSelectedHora(e.target.value)}
                  >
                    {horas2.map(hora => (
                      <option key={hora} value={hora}>
                        {formatHora(hora)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="materia">Materia:</Form.Label>
                  <Select
                    id="materia"
                    value={selectedMateria}
                    onChange={handleMateriaChange}
                    options={materias}
                    placeholder="Seleccione una materia"
                    isClearable={true}
                    isSearchable={true}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  >
                    {materias.map(materia => (
                      <option key={materia.id} value={materia.id}>
                        {materia.nombre}
                      </option>
                    ))}
                  </Select>
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="docente">Docente:</Form.Label>
                  <Select
                    id="docente"
                    value={selectedDocente}
                    onChange={handleDocenteChange}
                    options={docentes}
                    placeholder="Seleccione un docente"
                    isClearable={true}
                    isSearchable={true}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  >
                    {docentes.map(docente => (
                      <option key={docente.id} value={docente.id}>
                        {docente.nombre}
                      </option>
                    ))}
                  </Select>
                </Form.Group>
              </div>
            </div>

            <div className="button-group mt-4 text-center">
              {isEditing ? (
                <>
                  <Button
                    variant="custom"
                    id="save-btn"
                    onClick={handleSaveChanges}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="custom"
                    id="cancel-btn"
                    onClick={handleCancelEdit}
                    className="ml-2"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  variant="custom"
                  id="create-btn"
                  onClick={handleCreateHorario}
                >
                  Crear
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Horarios;
