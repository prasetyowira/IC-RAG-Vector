import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import react from '@vitejs/plugin-react';

dotenv.config({ path: '../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  publicDir: "assets",
  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  resolve: {
    alias: [
      {
        find: "backend",
        replacement: fileURLToPath(
          new URL("../declarations/backend", import.meta.url)
        ),
      },
      {
        find: "frontend",
        replacement: fileURLToPath(
          new URL("../declarations/frontend", import.meta.url)
        ),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
});
