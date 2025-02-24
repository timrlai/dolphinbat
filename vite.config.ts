import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: resolve("./vue"),
  base: "/static/",
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: false,
    watch: {
      usePolling: true,
      disableGlobbing: false,
    },
  },
  resolve: {
    extensions: [".js", ".json"],
    alias: {
      "@": fileURLToPath(new URL("./vue/src", import.meta.url)),
    },
  },
  build: {
    outDir: resolve("./vue/dist"),
    assetsDir: "",
    manifest: true,
    emptyOutDir: true,
    target: "es2015",
    rollupOptions: {
      input: {
        main: resolve("./vue/src/main.ts"),
      },
      output: {
        chunkFileNames: undefined,
      },
    },
  },
});
