import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fia from "@semicoder/fia/vite";
export default defineConfig({
  root: "frontend",
  resolve: {
    alias: [
      {
        find: /^node:module$/,
        replacement: resolve(import.meta.dirname, "frontend/node-module.ts"),
      },
    ],
  },
  define: {
    "process.versions.node": '"0.0.0"',
    "process.execArgv": "[]",
    "process.env.CORDIS_SHARED": "undefined",
  },
  plugins: [react(), fia()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      treeshake: {
        // Upstream's bundled barrel omits PURE markers on React component
        // factories and this Shiki theme value factory. Their unused return
        // values can be dropped without changing the original implementation.
        // These optional formatters have no host registration side effects.
        // Keep CSS imports; omit unused formatter JS imported by the DSH barrel.
        moduleSideEffects: (id) =>
          id.endsWith(".css") ||
          !/[\/]node_modules[\/](?:\.bun[\/][^/]+[\/]node_modules[\/])?(?:katex|shiki|@shikijs[\/]|anser|diff|simple-icons|mdast-util-|micromark)/.test(
            id,
          ),
        manualPureFunctions: ["memo", "forwardRef", "createContext", "createCssVariablesTheme"],
      },
    },
  },
});
