import { useEffect } from "react";

/**
 * Custom hook to register the service worker.
 */
export const useServiceWorker = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/serviceWorker.js").then(
        (registration) => {
          console.log(
            "ServiceWorker registration successful with scope:",
            registration.scope,
          );
        },
        (err) => {
          console.log("ServiceWorker registration failed: ", err);
        },
      );
    }
  }, []);
};
