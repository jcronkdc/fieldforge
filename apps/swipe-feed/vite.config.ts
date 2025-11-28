import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devPort = Number(env.VITE_DEV_PORT ?? 5173);

  return {
    base: env.VITE_BASE_URL || "/",
    plugins: [react()],
    define: {
      // Shim process for Node.js packages that reference it in browser
      // Use object literal, not JSON.stringify, so it's a real object
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
      },
      // Fallback for packages that check process directly
      'process': {
        env: {
          NODE_ENV: JSON.stringify(mode),
        },
      },
    },
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
            // 🐜 ANT OPTIMIZATION: Group related code for shortest pathways
            
            // Core React libs (largest, most shared - ~150 KB)
            'react-core': ['react', 'react-dom', 'react-router-dom'],
            
            // Supabase auth & db (heavily used - ~170 KB)
            'supabase': ['@supabase/supabase-js'],
            
            // UI libraries (Lucide icons, date-fns - ~80 KB)
            'ui-libs': ['lucide-react', 'date-fns'],
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
