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
const getValueFromDB = async (key, storeName = "globalCacheInfo") => {
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
 * Event listener for fetch events. Intercepts requests to the PopularCoinsList page and
 * modifies the request headers based on the data fetched from IndexedDB.
 * This ensures that Vercel's caching mechanism uniquely caches content for each currency and cache version.
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
 * Handles the incoming fetch request by adding the necessary headers.
 * @param {Request} request - The incoming fetch request.
 * @returns {Promise<Response>} A promise that resolves with the modified fetch response.
 */
async function handleRequest(request) {
  const newHeaders = new Headers(request.headers);

  // Delete any existing X-Current-Currency headers
  newHeaders.delete("X-Current-Currency");

  try {
    const currentCurrency = (await getValueFromDB("currentCurrency")) || "CAD";
    const globalCacheVersion =
      (await getValueFromDB("globalCacheVersion")) || Date.now().toString();

    newHeaders.set("X-Current-Currency", currentCurrency);
    newHeaders.set("X-Global-Cache-Version", globalCacheVersion);

    const newRequest = new Request(request, { headers: newHeaders });
    return fetch(newRequest);
  } catch (error) {
    // Check for the specific error and handle it
    if (error === "Database not initialized by the client.") {
      console.warn("Database not initialized. Using original request headers.");
      return fetch(request);
    }

    console.error("Error fetching data from IndexedDB:", error);
    return fetch(request); // If there's another error, just proceed with the original request.
  }
}
