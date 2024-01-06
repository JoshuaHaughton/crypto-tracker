import { useEffect } from "react";

/**
 * Custom hook to register the service worker.
 * The service worker will handle its own initialization using IndexedDB within its scope.
 */
export const useServiceWorker = () => {
  useEffect(() => {
    // Check if Service Workers are supported.
    if ("serviceWorker" in navigator) {
      // Register the service worker.
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then((registration) => {
          console.warn(
            "[Service-worker]: Registration successful with scope:",
            registration.scope,
          );
        })
        .catch((error) => {
          console.error("[Service-worker]: Registration failed:", error);
        });
    }
  }, []);
};
