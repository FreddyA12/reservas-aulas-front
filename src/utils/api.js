import axios from "axios";

const backUrl = "http://localhost:8080/"; // URL base de tu API

const api = axios.create({
  baseURL: backUrl,
  headers: {
    "Content-Type": "application/json",
  },
  // Aquí puedes añadir más configuraciones si es necesario
});
export default api;
