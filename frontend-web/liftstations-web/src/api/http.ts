import axios from "axios";

export const http = axios.create({
  baseURL: "/api", // ✅ unified entry point
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});