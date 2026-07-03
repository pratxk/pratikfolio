import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.js"],
    testTimeout: 20000, // mongodb-memory-server first-run download
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "/CONFIG.json": path.resolve(__dirname, "./CONFIG.json"),
    },
  },
});
