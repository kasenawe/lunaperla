import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      // Configure HMR for development across devices
      // - DISABLE_HMR=true: Disables HMR (required in AI Studio)
      // - VITE_HMR_HOST: Specify your machine's IP for mobile access (e.g., 192.168.x.x)
      // - Default: Auto-detects from browser's hostname (works on localhost)
      hmr:
        process.env.DISABLE_HMR === "true"
          ? false
          : process.env.VITE_HMR_HOST
            ? { host: process.env.VITE_HMR_HOST, protocol: "ws" }
            : true,
    },
  };
});
