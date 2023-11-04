// Message types
const SERVICE_WORKER_MESSAGE_TYPES = Object.freeze({
  INITIALIZE: "INITIALIZE",
  SET_USER_STATUS: "SET_USER_STATUS",
  SET_GLOBAL_CACHE_VERSION: "SET_GLOBAL_CACHE_VERSION",
  SET_CURRENCY: "SET_CURRENCY",
});

// Default values
let userStatus = "Logged-Out";
let globalCacheVersion = null;
let currentCurrency = "CAD";

/**
 * Service Worker message event listener.
 * This event handler updates the service worker's internal state based on messages from the main thread.
 */
self.addEventListener("message", (event) => {
  switch (event.data.type) {
    case SERVICE_WORKER_MESSAGE_TYPES.INITIALIZE:
      ({ currentCurrency, userStatus, globalCacheVersion } = event.data.data);
      console.warn("Service worker initialized with data:", event.data.data);
      break;
    case SERVICE_WORKER_MESSAGE_TYPES.SET_USER_STATUS:
      userStatus = event.data.value;
      console.warn(`[Service-worker]: User status updated to: ${userStatus}`);
      break;
    case SERVICE_WORKER_MESSAGE_TYPES.SET_GLOBAL_CACHE_VERSION:
      globalCacheVersion = event.data.value;
      console.warn(
        `[Service-worker]: Global cache version updated to: ${globalCacheVersion}`,
      );
      break;
    case SERVICE_WORKER_MESSAGE_TYPES.SET_CURRENCY:
      currentCurrency = event.data.value;
      console.warn(`[Service-worker]: Currency updated to: ${currentCurrency}`);
      break;
    default:
      // Log an error for an unknown message type
      console.error(
        `[Service-worker]: Unknown message type: ${event.data.type}`,
      );
  }
});

/**
 * Service Worker fetch event listener.
 * This event handler intercepts navigation fetch requests for all pages.
 * It updates request headers with the service worker's current state such as
 * currency, user status, and cache version to manage content caching strategies
 * and deliver personalized content.
 *
 * @param {FetchEvent} event - The fetch event triggered by a page request.
 */
self.addEventListener("fetch", (event) => {
  // Check if the fetch event is a navigation request.
  // A navigation request is made when the browser is navigating to a new page or refreshing the current one.
  if (
    event.request.mode === "navigate" ||
    (event.request.method === "GET" &&
      event.request.headers.get("accept").includes("text/html"))
  ) {
    // Respond to the navigation request with a custom response.
    event.respondWith(handleRequest(event.request));
  }
});

/**
 * Handles an incoming fetch request by adding custom headers based on the service worker's current state.
 * @param {Request} request - The incoming fetch request.
 * @returns {Promise<Response>} The fetch response with updated headers or the original fetch response in case of an error.
 */
async function handleRequest(request) {
  try {
    const newHeaders = new Headers(request.headers);
    newHeaders.set("X-Current-Currency", currentCurrency);
    newHeaders.set("X-User-Status", userStatus);
    newHeaders.set("X-Global-Cache-Version", globalCacheVersion?.toString());

    const newRequest = new Request(request, { headers: newHeaders });
    return await fetch(newRequest);
  } catch (error) {
    // Log the error and return the original request
    console.error(
      `[Service-worker]: Error during fetch event handling: ${error.message}`,
      error,
    );
    return fetch(request);
  }
}
