import { useEffect } from "react";

/**
 * Custom hook to register the service worker.
 */
export const useServiceWorker = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/serviceWorker.js").then(
          function (registration) {
            console.log(
              "ServiceWorker registration successful with scope:",
              registration.scope,
            );
          },
          function (err) {
            console.log("ServiceWorker registration failed: ", err);
          },
        );
      });
    }
  }, []);
};
