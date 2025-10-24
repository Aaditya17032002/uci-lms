// src/lib/apiClient.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // replace with your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});
