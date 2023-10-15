const DB_NAME = "CryptoTrackerDB";
const CURRENCY_OBJECT_STORE = "currentCurrency";

/**
 * Opens the IndexedDB and fetches the current currency.
 */
const getCurrentCurrencyFromDB = () => {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DB_NAME);

    openRequest.onerror = () => {
      reject("Error opening DB");
    };

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction(CURRENCY_OBJECT_STORE, "readonly");
      const store = transaction.objectStore(CURRENCY_OBJECT_STORE);
      const getRequest = store.get("currentCurrency");

      getRequest.onsuccess = () => {
        resolve(getRequest.result ? getRequest.result : currentCurrency);
      };

      getRequest.onerror = () => {
        reject("Error getting currency from DB");
      };
    };
  });
};

/**
 * Event listener for fetch events. Intercepts requests to the root path and
 * modifies the request headers based on the currency fetched from IndexedDB.
 * This ensures that Vercel's caching mechanism uniquely caches content for each currency.
 * When the user's currency preference changes, the differing header will cause Vercel's cache to be bypassed,
 * leading to the retrieval of fresh content tailored to the new preference.
 * @listens fetch
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Check if the request is for the root path (home index page)
  if (url.pathname === "/" || url.pathname === "/index.html") {
    event.respondWith(handleRequest(event.request));
  }
});

/**
 * Handles the incoming fetch request by adding an "X-Current-Currency" header based on the value in IndexedDB.
 * By setting this header, it directs Vercel's caching mechanism to consider the user's currency preference.
 * A change in currency preference will change this header, leading to cache busting on Vercel and the delivery of fresh content.
 * @param {Request} request - The incoming fetch request.
 * @returns {Promise<Response>} A promise that resolves with the modified fetch response or rejects with an error.
 */
async function handleRequest(request) {
  const newHeaders = new Headers(request.headers);

  // Delete any existing X-Current-Currency headers
  newHeaders.delete("X-Current-Currency");

  try {
    const currencyResult = await getCurrentCurrencyFromDB();
    const currency = currencyResult.value || "CAD";
    newHeaders.set("X-Current-Currency", currency);

    const newRequest = new Request(request, { headers: newHeaders });
    return fetch(newRequest);
  } catch (error) {
    console.error("Error fetching currency from IndexedDB:", error);
    return fetch(request); // If there's an error, just proceed with the original request.
  }
}
