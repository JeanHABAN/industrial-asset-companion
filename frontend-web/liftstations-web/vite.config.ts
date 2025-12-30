import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ✅ Unified: all /api/** requests -> backend http://localhost:8080/api/**
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // don’t rewrite — backend already uses /api
      },
    },
  },
});
