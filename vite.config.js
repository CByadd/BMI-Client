import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/", // 🔥 IMPORTANT FIX
  plugins: [react(), tailwindcss()],
});
