// src/lib/apiClient.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://localhost:7080/api", // replace with your API base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
});
