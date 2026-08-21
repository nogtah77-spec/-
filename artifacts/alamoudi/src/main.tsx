import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker with instant auto-update for PWA support
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      // Check for updates on every page load
      reg.update().catch(() => {});
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version available, take control immediately
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        }
      });
    }).catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
