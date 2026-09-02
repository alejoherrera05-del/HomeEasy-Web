import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const productPagesRoot = path.join(projectRoot, "productos");
const productPageInputs = existsSync(productPagesRoot)
  ? readdirSync(productPagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(productPagesRoot, entry.name, "index.html"))
  : [];

export default defineConfig({
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: [path.join(projectRoot, "index.html"), ...productPageInputs],
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
