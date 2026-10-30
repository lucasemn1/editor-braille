import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Em produção, o build é copiado para o filesystem do ESP32.
  // BASE_URL '/' garante que os assets sejam referenciados corretamente.
  base: "/",
  build: {
    outDir: "dist",
    // Mantém o bundle pequeno para caber na flash do ESP32 (tipicamente 4MB)
    chunkSizeWarningLimit: 300,
  },
  server: {
    // Proxy para o ESP32 durante o desenvolvimento local
    proxy: {
      "/api": {
        target: process.env.VITE_ESP32_URL ?? "http://192.168.4.1",
        changeOrigin: true,
      },
    },
  },
});
