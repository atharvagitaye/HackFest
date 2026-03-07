import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App.tsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

// Import PWA cleanup utilities (available in console as window.pwaDebug)
import "@/utils/pwaCleanup";

// Service worker is managed by vite-plugin-pwa (NO manual registration needed)
// vite-plugin-pwa automatically generates and registers the service worker
console.log("[PWA] Service worker managed by vite-plugin-pwa");
console.log("[PWA] Debug tools: window.pwaDebug.diagnose(), .reset(), .showPanel()");

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
