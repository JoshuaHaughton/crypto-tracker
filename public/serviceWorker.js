const DB_NAME = "CryptoTrackerDB";
const GLOBAL_CACHE_INFO_STORE = "globalCacheInfo";
let db;

// Schema from Dexie initialization code
const SCHEMA = {
  popularCoinsLists: "currency",
  coinDetails: "currency",
  currencyRates: "currency",
  globalCacheInfo: "key",
};

/**
 * Initialize and return the existing database. If the database doesn't exist or doesn't have the required object stores,
 * the promise will be rejected. The function expects the client-side logic to handle proper database initialization.
 *
 * @returns {Promise<IDBDatabase>} The initialized database if it exists and has the required object stores.
 * @throws {Error} Throws an error if the database doesn't exist, doesn't have the required object stores, or there's an issue accessing the IndexedDB.
 */
const initializeDB = () => {
  if (db) return Promise.resolve(db); // If db is already initialized, use it.

  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DB_NAME);
    openRequest.onerror = () => {
      reject("Error opening DB");
    };
    openRequest.onsuccess = () => {
      db = openRequest.result;
      // If the database doesn't have the expected objectStores, reject the promise
      for (const storeName in SCHEMA) {
        if (!db.objectStoreNames.contains(storeName)) {
          reject(`Database is missing the '${storeName}' object store.`);
          return;
        }
      }
      resolve(db);
    };
    openRequest.onupgradeneeded = (event) => {
      // If the database needs an upgrade, it might be because it doesn't exist.
      // Since we're relying on the client for initialization, we can simply close the database and reject.
      event.target.result.close();
      reject("Database not initialized by the client.");
    };
  });
};

/**
 * Fetches a value from the IndexedDB based on the specified key.
 * @param {string} key - The key to fetch from the IndexedDB.
 * @param {string} storeName - The name of the object store.
 * @returns {Promise<any>} The value associated with the key or null if not found.
 * @throws {Error} Throws an error if there's an issue accessing the IndexedDB.
 */
const getValueFromDB = async (key, storeName = GLOBAL_CACHE_INFO_STORE) => {
  await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const getRequest = store.get(key);
    getRequest.onsuccess = () => {
      resolve(getRequest.result ? getRequest.result.value : null);
    };
    getRequest.onerror = () => {
      reject("Error getting value from DB");
    };
  });
};

/**
 * Event listener for fetch events that intercepts requests to all navigable pages.
 * This handler modifies the request headers based on the data fetched from IndexedDB,
 * such as the current currency, cache version, and user logged-in status.
 * These headers are used for cache control and content personalization on the server side.
 *
 * @listens fetch - The fetch event triggered by a page request.
 */
self.addEventListener("fetch", (event) => {
  // Check if the request is a navigation request or a GET request that accepts HTML.
  // This generally includes document navigation requests such as link clicks or address bar navigations.
  const isNavigationOrHTMLRequest =
    event.request.mode === "navigate" ||
    (event.request.method === "GET" &&
      event.request.headers.get("accept")?.includes("text/html"));

  if (isNavigationOrHTMLRequest) {
    // Use handleRequest function to manage custom headers based on IndexedDB data.
    event.respondWith(handleRequest(event.request));
  }
});

/**
 * Handles the incoming fetch request by adding the necessary headers.
 *
 * @async
 * @param {Request} request - The incoming fetch request.
 * @returns {Promise<Response>} A promise that resolves with the modified fetch response.
 */
async function handleRequest(request) {
  const newHeaders = new Headers(request.headers);

  try {
    // Fetch values from IndexedDB
    const currentCurrency = (await getValueFromDB("currentCurrency")) || "CAD";
    const globalCacheVersion =
      (await getValueFromDB("globalCacheVersion")) || Date.now().toString();
    const isLoggedInValue = (await getValueFromDB("isLoggedIn")) || "false";

    // Set the headers with the fetched values
    newHeaders.set("X-Current-Currency", currentCurrency);
    newHeaders.set("X-Global-Cache-Version", globalCacheVersion);
    newHeaders.set("X-Is-Logged-In", isLoggedInValue);

    // Create a new request with updated headers
    const newRequest = new Request(request, { headers: newHeaders });
    return fetch(newRequest);
  } catch (error) {
    // Log the specific error and return the original request
    console.warn(
      `[Service-worker]: Error during fetch event handling: ${error.message}`,
    );
    return fetch(request);
  }
}
