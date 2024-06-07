import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Form, Modal } from "react-bootstrap";
import "../styles/horario.css";
import axios from "axios";
import Swal from "sweetalert2";

function Horarios() {
  // Variables reactivas
  const [bloques, setBloques] = useState([]);
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
  
  const [selectedCell, setSelectedCell] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const handleCellClick = (e, rowIndex, cellIndex) => {
    setSelectedCell({ rowIndex, cellIndex });
    setContextMenuPosition({ top: e.pageY, left: e.pageX });
    setShowContextMenu(true);
  };

  const fetchAulasLabs = async () => {
    const url = `http://localhost:8080/espacio/bloque/${selectedBloque}`;

    try {
      const response = await axios.get(url);
      //Aqui se debe controlar que se llene de acuerdo al tipo
      let filteredData = [];
      if (selectedTipo == "Aula") {
        filteredData = response.data.filter(item => item.tipo === "Aula");
      } else {
        filteredData = response.data.filter(
          item => item.tipo === "Laboratorio"
        );
      }
      setAulasLabs(filteredData);
    } catch (error) {
      const { message } = error.response.data;
      if (message === "No hay espacios en este bloque") {
        Swal.fire({
          title: "Oops...",
          html: `<i>${message}</i>`,
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Oops...",
          html: `<i>Error al conectar con el servidor</i>`,
          icon: "error",
        });
      }
      setAulasLabs([]); // Limpia los datos si la petición falla
    }
  };

  const getHorarios = async () => {
    const url =
      selectedTipo === "Laboratorio"
        ? `http://localhost:8080/horario/lab/${selectedAulaLab}`
        : `http://localhost:8080/horario/aula/${selectedAulaLab}`;
    try {
      const response = await axios.get(url);
      setHorarios(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setHorarios([]); // Limpia los datos si la petición falla
    }
  };

  const getMaterias = async () => {
    const url = "http://localhost:8080/materia/todos";
    try {
      const respuesta = await axios.get(url);
      setMaterias(respuesta.data);
    } catch (error) {
      const { message } = error.response.data;
      console.log(message);
    }
  };

  const getBloques = async () => {
    try {
      const resp = await axios.get("http://localhost:8080/bloque");
      setBloques(resp.data);
    } catch (error) {
      const { message } = error.response.data;
      console.log(message);
    }
  };

  const handleBloqueChange = event => {
    setSelectedBloque(event.target.value);
  };

  const handleTipoChange = event => {
    setSelectedTipo(event.target.value);
    console.log(selectedTipo);
  };

  const handleAulaLabChange = event => {
    setSelectedAulaLab(event.target.value);
  };

  const handleDocenteChange = event => {
    setSelectedDocente(event.target.value);
  };

  const handleCreateHorario = async () => {
    try {
      const horarioExiste = horarios.some(
        horario =>
          horario.dia === selectedDia &&
          horario.hora === selectedHora.split("-")[0]
      );
      if (horarioExiste) {
        Swal.fire({
          title: "Error",
          text: "Ya existe un horario en el mismo día y hora",
          icon: "error",
        });
        return;
      }

      const idPersona = document.getElementById("docente").value;
      const url = "http://localhost:8080/horario";
      const nuevoHorario = {
        dia: selectedDia,
        hora: selectedHora.split("-")[0],
        id_materia: selectedMateria,
        id_persona: idPersona,
        id_espacio: selectedAulaLab,
      };

      console.log(nuevoHorario);

      await axios.post(url, nuevoHorario);

      Swal.fire({
        title: "Éxito",
        text: "Horario creado correctamente",
        icon: "success",
      });

      getHorarios();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo crear el horario",
        icon: "error",
      });
    }
  };

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
      console.log("a");
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

  const renderTableCell = (dia, hora) => {
    if (hora === "13-14") {
      return <td style={{ backgroundColor: "#ffcccb" }}>Receso</td>;
    }
    const horario = horarios.find(
      h => h.dia === dia && h.hora === hora.split("-")[0]
    );
    return horario ? `${horario.nombre}` : "";
  };
 

  const handleDocumentClick = (e) => {
    if (!e.target.closest(".context-menu") && !e.target.closest("td")) {
      setSelectedCell(null);
      setShowContextMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

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
  const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];

  return (
    <div className="container">
      <div className="container mt-4">
        <div className="header text-center">
          <h2>Horarios</h2>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Form id="form-horarios">
              <div className="form-container">
                <Form.Group className="form-group">
                  <Form.Label htmlFor="bloque">Bloque:</Form.Label>
                  <Form.Control
                    as="select"
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
                  </Form.Control>
                </Form.Group>

                <Form.Group className="form-group col-md-6">
                  <Form.Label htmlFor="aula">Tipo:</Form.Label>
                  <Form.Control
                    as="select"
                    id="aula"
                    className="form-control"
                    value={selectedTipo}
                    onChange={handleTipoChange}
                    name="aula"
                  >
                    <option value="Aula">Aulas</option>
                    <option value="Laboratorio">Laboratorios</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="form-group">
                  <Form.Label htmlFor="aula-lab">Aula/Laboratorio:</Form.Label>
                  <Form.Control
                    as="select"
                    id="aula-lab"
                    className="form-control"
                    value={selectedAulaLab}
                    onChange={handleAulaLabChange}
                    name="aulaLab"
                  >
                    {aulasLabs.map(aulaLab => (
                      <option key={aulaLab.id} value={aulaLab.id}>
                        {aulaLab.nombre}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
              <hr />
              <h5
                className="nuevo-horario"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseForm"
                aria-expanded="false"
                aria-controls="collapseForm"
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: "bold",
                }}
                onMouseOver={({ target }) =>
                  (target.style.textDecoration = "underline")
                }
                onMouseOut={({ target }) =>
                  (target.style.textDecoration = "none")
                }
              >
                Nuevo Horario
              </h5>
              <div className="collapse " id="collapseForm">
                <div className="form-container">
                  <Form.Group className="form-group">
                    <Form.Label htmlFor="dia">Día:</Form.Label>
                    <Form.Control
                      as="select"
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
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="form-group">
                    <Form.Label htmlFor="hora">Hora:</Form.Label>
                    <Form.Control
                      as="select"
                      id="hora"
                      className="form-control"
                      value={selectedHora}
                      onChange={e => setSelectedHora(e.target.value)}
                    >
                      <option>7-8</option>
                      <option>8-9</option>
                      <option>9-10</option>
                      <option>10-11</option>
                      <option>11-12</option>
                      <option>12-13</option>
                      <option>14-15</option>
                      <option>15-16</option>
                      <option>16-17</option>
                      <option>17-18</option>
                      <option>18-19</option>
                      <option>19-20</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="form-group">
                    <Form.Label htmlFor="materia">Materia:</Form.Label>
                    <Form.Control
                      as="select"
                      id="materia"
                      className="form-control"
                      value={selectedMateria}
                      onChange={e => {
                        setSelectedMateria(e.target.value);
                        console.log(selectedMateria);
                      }}
                    >
                      {materias.map(materia => (
                        <option key={materia.id} value={materia.id}>
                          {materia.nombre}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <div className="form-group docente-container">
                    <Form.Label htmlFor="docente">Docente</Form.Label>
                    <input
                      type="text"
                      id="docente"
                      placeholder="Ingrese un numero de cedula"
                      className="form-control"
                      onChange={handleDocenteChange}
                      value={selectedDocente}
                    />
                  </div>
                </div>
                <div className="form-container">
                  <div className="form-group d-flex align-items-end">
                    <Button
                      variant="custom"
                      id="agregar-btn"
                      onClick={handleCreateHorario}
                    >
                      Crear Horario
                    </Button>
                    <Button
                      variant="custom"
                      id="guardar-btn"
                      style={{ display: "none" }}
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
            <table className="table table-bordered mt-4 table-centered">
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
                  <tr
                    key={hora}
                    style={
                      hora === "13-14"
                        ? { backgroundColor: "#ffcccb", textAlign: "center" }
                        : {}
                    }
                  >
                    <td style={hora === "13-14" ? { textAlign: "center" } : {}}>
                      {hora}
                    </td>
                    {dias.map((dia, cellIndex) => (
                      <React.Fragment key={`${dia}-${hora}`}>
                        {hora === "13-14" ? (
                          <td
                            style={{
                              backgroundColor: "#ffcccb",
                              textAlign: "center",
                            }}
                          >
                            Receso
                          </td>
                        ) : (
                          <td
                            onClick={e =>
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
                            {renderTableCell(dia, hora)}
                          </td>
                        )}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="context-menu"
              id="context-menu"
              style={{
                display: showContextMenu ? "block" : "none",
                top: contextMenuPosition.top,
                left: contextMenuPosition.left,
              }}
            >
              <Button variant="custom" id="editar-btn">
                Editar
              </Button>
              <Button variant="custom" id="eliminar-btn">
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Horarios;
