import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devPort = Number(env.VITE_DEV_PORT ?? 5173);

  return {
    base: env.VITE_BASE_URL || "/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-swipeable", "react-router-dom"],
            supabase: ["@supabase/supabase-js"],
          },
        },
      },
    },
    server: {
      port: Number.isNaN(devPort) ? 5173 : devPort,
      host: "0.0.0.0",
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/tests/setupTests.ts",
      css: true,
    },
  };
});
