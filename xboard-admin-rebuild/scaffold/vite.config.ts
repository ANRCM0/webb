import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
/** Visual-regression harness: `BASE_URL=/app/ npm run build` produces a sub-path build. */
const base = process.env.BASE_URL || "/";
export default defineConfig({ base, plugins: [react()], resolve: { alias: { "@": path.resolve(__dirname, "src") } } });
