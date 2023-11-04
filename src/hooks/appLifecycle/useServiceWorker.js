import { useEffect } from "react";
import {
  getCurrencyFromCookies,
  getGlobalCacheVersionFromCookies,
  getUserStatusFromCookies,
  postMessageToServiceWorker,
} from "../../utils/cache.utils";
import { SERVICE_WORKER_MESSAGE_TYPES } from "../../global/constants";

/**
 * Function to send initial data to the service worker once it's active.
 */
function sendInitializationData() {
  const currentCurrency = getCurrencyFromCookies();
  const userStatus = getUserStatusFromCookies();
  const globalCacheVersion = getGlobalCacheVersionFromCookies();

  postMessageToServiceWorker({
    type: SERVICE_WORKER_MESSAGE_TYPES.INITIALIZE,
    data: { currentCurrency, userStatus, globalCacheVersion },
  });
}

/**
 * Custom hook to register the service worker and initialize its state with values from cookies.
 * It handles the case where the service worker might not be immediately controlling the page.
 */
export const useServiceWorker = () => {
  useEffect(() => {
    // Feature detection for service workers.
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register the service worker.
      navigator.serviceWorker
        .register("/serviceWorker.js")
        .then((registration) => {
          console.warn(
            "ServiceWorker registration successful with scope:",
            registration.scope,
          );

          // If the service worker is already active, send the initialization data.
          if (navigator.serviceWorker.controller) {
            sendInitializationData();
          } else {
            // Set up a listener to send the initialization data once the service worker becomes active.
            // This is necessary because the service worker registration process is asynchronous.
            // After a service worker is registered, it enters the "installing" phase and then the "activating" phase.
            // It is only after these steps that the service worker can take control of the page (becomes "active").
            // Therefore, if the service worker is not already controlling the page,
            // we need to wait for it to become active before sending messages to it.
            const onControllerChange = () => {
              sendInitializationData();
              // It's important to remove the event listener once the initialization data has been sent
              // to avoid the initialization data being sent multiple times if the controller changes again.
              // This could happen, for example, if the service worker is updated.
              navigator.serviceWorker.removeEventListener(
                "controllerchange",
                onControllerChange,
              );
            };

            navigator.serviceWorker.addEventListener(
              "controllerchange",
              onControllerChange,
            );
          }
        })
        .catch((err) => {
          console.error("ServiceWorker registration failed: ", err);
        });
    }
  }, []);
};
