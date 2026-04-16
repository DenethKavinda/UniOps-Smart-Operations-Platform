import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  // Let the browser set multipart boundaries for FormData payloads.
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers["Content-Type"];
    }
    return config;
  }

  config.headers = config.headers || {};
  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default api;
