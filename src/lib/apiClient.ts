// src/lib/apiClient.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://localhost:7080/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Basic request/response logging for debugging
apiClient.interceptors.request.use((config) => {
  // eslint-disable-next-line no-console
  console.log("[axios] →", config.method?.toUpperCase(), config.baseURL + (config.url || ""), config);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line no-console
    console.log("[axios] ←", response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    // eslint-disable-next-line no-console
    console.log("[axios] ✖", error?.response?.status, error?.config?.url, error?.response?.data || error?.message);
    return Promise.reject(error);
  }
);
