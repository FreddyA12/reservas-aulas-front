import axios from "axios";
import { PROJECT_PROFILE, DEV_API_URL, PROD_API_URL } from "./consts";

const backUrl = PROJECT_PROFILE === "prod" ? PROD_API_URL : DEV_API_URL;

const api = axios.create({
  baseURL: backUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
