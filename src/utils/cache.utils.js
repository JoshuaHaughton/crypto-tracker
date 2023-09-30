import db from "./database";
import {
  CACHE_EXPIRY_TIME_IN_MINUTES,
  COINDETAILS_TABLENAME,
  COINLISTS_TABLENAME,
} from "../global/constants";
import Cookie from "js-cookie";
import { initializeStore } from "../store";
import { fetchDataForCoinListCacheInitialization } from "./api.utils";
import { updateStoreData } from "../store/root";
import { initializeCoinListCache } from "../thunks/coinListCacheThunk";

/**
 * Marks a property in the localStorage as valid with an expiration timestamp.
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @param {string} key - The key under which the value should be stored.
 */
export const setToLocalStorageWithExpiry = (tableName, key) => {
  const now = Date.now();
  const expiry = now + CACHE_EXPIRY_TIME_IN_MINUTES * 60 * 1000;
  localStorage.setItem(
    `${tableName}_${key}`,
    JSON.stringify({ value: "valid", expiry }),
  );
};

/**
 * Retrieves a value from the localStorage. If the value has expired, it will be removed.
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @param {string} key - The key under which the value is stored.
 * @returns {any|null} - The stored value or null if not found or expired.
 */
export const getFromLocalStorageWithExpiryCheck = (tableName, key) => {
  const itemStr = localStorage.getItem(`${tableName}_${key}`);
  if (!itemStr) return null;

  const { value, expiry } = JSON.parse(itemStr);
  if (Date.now() > expiry) {
    localStorage.removeItem(`${tableName}_${key}`);
    return null;
  }
  return value;
};

/**
 * Checks if the cache for a specific table and key is valid.
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @returns {boolean} - Indicates whether the cache is valid or not.
 */
export const isCacheValid = (tableName) => {
  const currencies = ["USD", "CAD", "AUD", "GBP"];
  return currencies.every(
    (currency) =>
      getFromLocalStorageWithExpiryCheck(tableName, currency) === "valid",
  );
};

/**
 * Clears cache for a specific table and key.
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @param {string} key - The key for which to clear the cache.
 */
export const clearCache = async (tableName, key) => {
  try {
    await db[tableName].delete(key);
    console.log(`Cache cleared from IndexedDB for ${key} in ${tableName}`);
  } catch (err) {
    console.error(
      `Error clearing cache from IndexedDB for ${key} in ${tableName}:`,
      err,
    );
  }

  localStorage.removeItem(`${tableName}_${key}`);
  console.log(`Cache cleared from localStorage for ${key} in ${tableName}`);
};

/**
 * Clears cache for all keys in a specific table.
 * @param {string} tableName - The name of the table in the IndexedDB.
 */
export const clearCacheForAllKeysInTable = async (tableName) => {
  try {
    await db[tableName].clear(); // Clear all keys in the table
    console.log(`Cache cleared from IndexedDB for all keys in ${tableName}`);
  } catch (err) {
    console.error(
      `Error clearing cache from IndexedDB for all keys in ${tableName}:`,
      err,
    );
  }

  // Clear from localStorage
  for (const key in localStorage) {
    if (key.startsWith(`${tableName}_`)) {
      localStorage.removeItem(key);
    }
  }
  console.log(`Cache cleared from localStorage for all keys in ${tableName}`);
};

/**
 * Fetches data from indexedDB cache.
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @param {string} key - The key for the data to be fetched.
 * @returns {Promise<any>} - Returns a promise that resolves to the fetched data or `null` if not found.
 */
export const fetchDataFromIndexedDB = async (tableName, key) => {
  try {
    const data = await db[tableName].get(key);
    return data || null;
  } catch (err) {
    console.error(
      `Error fetching data from IndexedDB from ${tableName} for ${key}:`,
      err,
    );
    return null;
  }
};

/**
 * Saves coin data to IndexedDB for a specific currency and sets its expiry in localStorage.
 *
 * @param {string} tableName - The name of the table in the IndexedDB where the coin data should be stored.
 * @param {string} currency - The currency identifier under which the coin data should be stored.
 * @param {Object} coinData - The data related to the specified currency that needs to be stored.
 *
 * @returns {Promise<void>} - Resolves when the data is successfully saved and its expiry is set in localStorage.
 */
export const saveCoinDataForCurrencyInBrowser = async (
  tableName,
  currency,
  coinData,
) => {
  try {
    if (tableName === COINDETAILS_TABLENAME) {
      // Get the existing coin data for the specified currency
      const existingCoinData = await db[tableName].get(currency);

      // Merge existing data with the new coin data
      const mergedCoinData = {
        ...existingCoinData,
        [coinData.symbol]: coinData,
      };

      await db[tableName].put({ currency, details: mergedCoinData });
    } else {
      await db[tableName].put({ currency, coinData });
    }
    setToLocalStorageWithExpiry(tableName, currency);
    console.log(
      `Successfully saved ${currency} data to ${tableName} in IndexedDB and set expiry in localStorage.`,
    );
  } catch (err) {
    console.error(
      `Error saving data to IndexedDB for ${currency} in ${tableName} and setting expiry in localStorage`,
      err,
    );
  }
};

/**
 * Clears cache from local storage, indexedDB, and cookies.
 */
const clearAllCache = () => {
  clearCacheForAllKeysInTable(COINLISTS_TABLENAME);
  clearCacheForAllKeysInTable(COINDETAILS_TABLENAME);
  Cookie.remove("preloadedCoins");
};

/**
 * Resets and updates the Redux store.
 *
 * @param {Object} store - The Redux store.
 * @returns {Promise<void>}
 */
const resetAndUpdateStore = async (store) => {
  const coinListCacheData = await fetchDataForCoinListCacheInitialization();
  store.dispatch(updateStoreData(coinListCacheData));
  store.dispatch(initializeCoinListCache());
};

/**
 * Checks and resets the cache based on the server's global cache version.
 *
 * In development mode, the `globalCacheVersion` changes with every refresh due
 * to frequent revalidations. To avoid unnecessary cache resets due to this, we bypass
 * the check for `globalCacheVersion` in development mode. However, the cache will still
 * reset every 5 minutes in both development and production.
 * In production, the `globalCacheVersion` is expected to change every 5 minutes.
 *
 * @param {Object} store - The Redux store.
 * @param {string} serverGlobalCacheVersion - The global cache version from the server.
 * @returns {Promise<void>}
 */
export const checkAndResetCache = async (store, serverGlobalCacheVersion) => {
  const currentTime = Date.now();
  const fiveMinutesInMilliseconds = 5 * 60 * 1000;
  const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");

  let shouldResetCache =
    !isCacheValid(COINLISTS_TABLENAME) ||
    currentTime - clientGlobalCacheVersion > fiveMinutesInMilliseconds;

  if (process.env.NODE_ENV !== "development") {
    shouldResetCache =
      shouldResetCache || serverGlobalCacheVersion !== clientGlobalCacheVersion;
  }

  if (shouldResetCache) {
    console.log("Cache Reset");
    console.log("serverGlobalCacheVersion", serverGlobalCacheVersion);
    console.log("clientGlobalCacheVersion", clientGlobalCacheVersion);

    // Clear all caches
    clearAllCache();

    // Reset the Redux store completely
    initializeStore();

    const newGlobalCacheVersion =
      serverGlobalCacheVersion !== clientGlobalCacheVersion
        ? serverGlobalCacheVersion
        : currentTime.toString();

    Cookie.set("globalCacheVersion", newGlobalCacheVersion);
    localStorage.setItem("lastCacheReset", currentTime);

    // If the server's cache version matches the client's, fetch fresh data and then update the store.
    if (serverGlobalCacheVersion === clientGlobalCacheVersion) {
      await resetAndUpdateStore(store);
    }
  }
};
