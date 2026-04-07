import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";
import { inlineWorkerPlugin } from "./vite-plugin-inline-worker";

export default defineConfig({
  plugins: [
    inlineWorkerPlugin(),
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "xlsx-validator",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.mjs" : "index.cjs"),
    },
    rollupOptions: {
      external: (id) =>
        ["react", "react-dom", "xlsx", "zod"].some(
          (dep) => id === dep || id.startsWith(dep + "/"),
        ),
    },
  },
  worker: {
    format: "es",
  },
});
