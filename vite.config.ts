import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "/IRPG-2026/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        manual: resolve(__dirname, "manual.html"),
        checklists: resolve(__dirname, "checklists.html"),
        saved: resolve(__dirname, "saved.html"),
        settings: resolve(__dirname, "settings.html"),
        checklist: resolve(__dirname, "checklist/index.html")
      }
    }
  }
});
