import api from "../utils/api";

class MateriaService {
  async getMateriasWithParams(params) {
    try {
      const { data } = await api.get("materia/filtered", { params });
      return data;
    } catch (error) {
      if (error.response) {
        const { message } = error.response.data;
        if (message !== "No hay materias") {
          throw "Error al conectar con el servidor.";
        }
      } else {
        throw "Error al conectar con el servidor.";
      }
    }
  }

  async guardarMateria(materia) {
    try {
      const { data } = await api.post("materia", materia);
      return data;
    } catch (error) {
      throw "No se pudo guardar el registro. Por favor, inténtelo de nuevo.";
    }
  }

  async editarMateria(materia) {
    try {
      const { data } = await api.post("materia", materia);
      return data;
    } catch (error) {
      throw "No se pudo actualizar el registro. Por favor, inténtelo de nuevo.";
    }
  }

  async eliminarMateria(id) {
    try {
      await api.delete(`materia/${id}`);
    } catch (error) {
      throw "No se pudo eliminar el registro. Es posible que este asociado a un horario.";
    }
  }
}

export default new MateriaService();
