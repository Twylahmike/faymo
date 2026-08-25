import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Only the GitHub Pages workflow builds with GITHUB_PAGES=true (it's served
  // from /faymo/); Lovable's own build/preview is served from the domain
  // root, so it must always get base "/".
  base: mode === "production" && process.env.GITHUB_PAGES ? "/faymo/" : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
