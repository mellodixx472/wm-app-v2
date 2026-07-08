import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative Pfade, damit der Build auch unter einem Unterpfad
  // funktioniert (GitHub Pages: https://<user>.github.io/wm-app-v2/)
  base: "./",
  plugins: [react()],
});
