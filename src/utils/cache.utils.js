import db from "./database";
import { CACHE_EXPIRY_TIME_IN_MINUTES } from "../global/constants";

/**
 * Stores a value in the localStorage with an expiration timestamp.
 *
 * @param {string} key - The key under which the value should be stored.
 * @param {any} value - The value to be stored.
 */
export const setToLocalStorageWithExpiry = (key, value) => {
  const now = Date.now();
  const expiry = now + CACHE_EXPIRY_TIME_IN_MINUTES * 60 * 1000;
  localStorage.setItem(key, JSON.stringify({ value, expiry }));
};

/**
 * Retrieves a value from the localStorage. If the value has expired, it will be removed.
 *
 * @param {string} key - The key under which the value is stored.
 * @returns {any|null} - The stored value or null if not found or expired.
 */
const getFromLocalStorageWithExpiryCheck = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const { value, expiry } = JSON.parse(itemStr);
  if (Date.now() > expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return value;
};

/**
 * Checks if the cache is valid for all the specified currencies.
 *
 * @returns {boolean} - Returns true if the cache is valid for all currencies, false otherwise.
 */
export const isCacheValid = () => {
  const currencies = ["USD", "CAD", "AUD", "GBP"];
  return currencies.every(
    (currency) =>
      getFromLocalStorageWithExpiryCheck(`coinList_${currency}`) === "valid",
  );
};

/**
 * Clears the cache for a specific currency from both IndexedDB and localStorage.
 *
 * @param {string} currency - The currency for which the cache should be cleared.
 */
export const clearCacheForCurrency = async (currency) => {
  try {
    await db.coinLists.delete(currency);
    console.log(`Cache cleared from IndexedDB for ${currency}`);
  } catch (err) {
    console.error(`Error clearing cache from IndexedDB for ${currency}:`, err);
  }

  localStorage.removeItem(`coinList_${currency}`);
  console.log(`Cache cleared from localStorage for ${currency}`);
};

/**
 * Fetches the cached coin data from IndexedDB and dispatches it to the Redux store.
 *
 * @param {Function} dispatch - The Redux dispatch function.
 * @returns {Promise<boolean>} - Returns a promise that resolves to `true` if data is fetched successfully; otherwise, it throws an error.
 *
 */
export const fetchDataFromCache = async (dispatch) => {
  return db.coinLists
    .each((data) => {
      if (data != null && data.coins) {
        // Dispatching the fetched coin data to Redux store
        dispatch(
          coinsActions.setCoinListForCurrency({
            currency: data.currency,
            coinData: data.coins,
          }),
        );
      }
    })
    .then(() => true) // Successful fetching of data
    .catch((err) => {
      console.error("Error fetching data from IndexedDB:", err);
    });
};
