import db from "./database";
import {
  ALL_CURRENCIES,
  CACHE_EXPIRY_TIME_IN_MINUTES,
  COINDETAILS_TABLENAME,
  COINLISTS_TABLENAME,
  CURRENCYRATES_TABLENAME,
  GLOBALCACHEVERSION_COOKIE_EXPIRY_TIME,
} from "../global/constants";
import Cookie from "js-cookie";
import { initializeStore } from "../store";
import { fetchDataForCoinListCacheInitialization } from "./api.utils";
import { initializeCoinListCache } from "../thunks/coinListCacheThunk";
import { updateStoreData } from "./store.utils";

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
  const currencies = ALL_CURRENCIES;
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
      const existingCoinData = (await db[tableName].get(currency)) || {};

      // Get the coin's symbol from the data
      const coinSymbol = coinData.coinInfo.symbol;

      // Merge the new coin data into the existing data for the currency
      const mergedCoinData = {
        ...existingCoinData,
        [coinSymbol]: coinData,
      };

      // Add the currency property to the mergedCoinData object for indexedDB queries
      mergedCoinData.currency = currency;

      // Store the merged data back into the database
      await db[tableName].put(mergedCoinData);

      // Store the merged data back into the database
      await db[tableName].put(mergedCoinData, currency);
    } else if (tableName === COINLISTS_TABLENAME) {
      await db[tableName].put({ currency, coinData });
    } else if (tableName === CURRENCYRATES_TABLENAME) {
      await db[tableName].put({ currency, rates: coinData });
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
 * Validates if the necessary caches in IndexedDB are valid.
 *
 * @param {number} [serverGlobalCacheVersion] - The global cache version from the server (optional, and should not be provided by the client cookie).
 * @returns {Promise<boolean>} - Returns `true` if all caches are valid, otherwise `false`.
 */
export const areNecessaryCachesValid = async (serverGlobalCacheVersion) => {
  console.log("areNecessaryCachesValid");
  // GlobalCacheVersion checks
  const currentTime = Date.now();
  const fiveMinutesInMilliseconds = 5 * 60 * 1000;
  const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");

  let shouldResetCache =
    currentTime - clientGlobalCacheVersion > fiveMinutesInMilliseconds;

  if (process.env.NODE_ENV !== "development" && serverGlobalCacheVersion) {
    shouldResetCache =
      shouldResetCache || serverGlobalCacheVersion !== clientGlobalCacheVersion;
  }

  if (shouldResetCache) {
    console.warn("Invalid GlobalCacheVersion");
    return false;
  }
  console.log("Valid GlobalCacheVersion!");

  // Check if all IndexedDB CoinList caches are valid
  try {
    for (const currency of ALL_CURRENCIES) {
      const coinDataForCurrency = await fetchDataFromIndexedDB(
        COINLISTS_TABLENAME,
        currency,
      );

      // Check that the coinData key is not null and is a non-empty array
      if (
        !coinDataForCurrency ||
        !Array.isArray(coinDataForCurrency.coinData) ||
        coinDataForCurrency.coinData.length === 0
      ) {
        console.warn(`Invalid coin data for currency: ${currency}`);
        return false;
      }
    }
    console.log("Valid CoinList Cache!");
    // return true;
  } catch (err) {
    console.error(`Error validating coin data for all currencies:`, err);
    return false;
  }

  // Check if all IndexedDB CurrenyRates caches are valid
  try {
    for (const currency of ALL_CURRENCIES) {
      const currencyRatesForCurrency = await fetchDataFromIndexedDB(
        CURRENCYRATES_TABLENAME,
        currency,
      );

      // Check that the rates key is not null and has valid numbers for each currency
      if (!currencyRatesForCurrency || !currencyRatesForCurrency.rates) {
        console.warn(`Invalid rates data for currency: ${currency}`);
        return false;
      }

      // Validate each rate is a valid number
      for (const rateCurrency in currencyRatesForCurrency.rates) {
        const rateValue = currencyRatesForCurrency.rates[rateCurrency];
        if (typeof rateValue !== "number" || isNaN(rateValue)) {
          console.warn(`Invalid rate for ${rateCurrency} in ${currency}`);
          return false;
        }
      }
    }
    console.log("Valid CurrencyRates Cache!");
    return true;
  } catch (err) {
    console.error(`Error validating rates for all currencies:`, err);
    return false;
  }
};

/**
 * Clears cache from local storage, indexedDB, and cookies.
 */
export const clearAllCaches = async () => {
  console.warn("CLEARING ALL CACHES");
  await clearCacheForAllKeysInTable(COINLISTS_TABLENAME);
  await clearCacheForAllKeysInTable(COINDETAILS_TABLENAME);
  await clearCacheForAllKeysInTable(CURRENCYRATES_TABLENAME);
  Cookie.remove("preloadedCoins");
};

/**
 * Validates and clears cache if necessary.
 *
 * @param {string} serverGlobalCacheVersion - The global cache version from the server (optional, and should not be provided by the client cookie).
 * @returns {Promise<void>}
 */
export const validateAndClearCache = async (serverGlobalCacheVersion) => {
  const validCache = await areNecessaryCachesValid(serverGlobalCacheVersion);
  console.log("validCache", validCache);
  if (!validCache) {
    await clearAllCaches();
  }
};

/**
 * Stores currency rates in IndexedDB cache.
 *
 * @param {Object} currencyRates - The currency rates data to be stored.
 * @returns {Promise<void>} - Returns a promise that resolves when all storage operations are complete.
 */
export const storeCurrencyRatesInIndexedDB = (currencyRates) => {
  const storagePromises = [];

  for (const key of Object.keys(currencyRates)) {
    const promise = saveCoinDataForCurrencyInBrowser(
      CURRENCYRATES_TABLENAME,
      key,
      currencyRates[key],
    );
    storagePromises.push(promise);
  }

  try {
    Promise.all(storagePromises);
  } catch (error) {
    console.error("Error storing currency rates in IndexedDB:", error);
    throw error;
  }
};

/**
 * Fetches data for multiple currencies from IndexedDB cache.
 *
 * @param {string} tableName - The name of the table in IndexedDB.
 * @param {string[]} currencyKeys - An array of currency keys to fetch data for.
 * @returns {Promise<{ [key: string]: any }>} - Returns a promise that resolves to an object
 *   where each key is a currency key and the corresponding value is the fetched data, or `null` if not found.
 */
export const fetchCurrencyDataFromIndexedDB = async (
  tableName,
  currencyKeys = ALL_CURRENCIES,
) => {
  const fetchedData = {};

  for (const key of currencyKeys) {
    try {
      const data = await db[tableName].get(key);
      fetchedData[key] = data || null;
    } catch (err) {
      console.error(
        `Error fetching data from IndexedDB from ${tableName} for ${key}:`,
        err,
      );
      fetchedData[key] = null;
    }
  }

  return fetchedData;
};

/**
 * Fetches new CoinList Data, updates the Redux store, and then reinitializes the CoinList Cache.
 *
 * If `shouldIgnoreCache` is set to false, the function checks the cache and attempts to fetch the coin list data from it.
 * If the cache fetch fails or returns invalid data, it logs an error and proceeds to fetch from the API.
 *
 * If `shouldIgnoreCache` is set to true, the function directly fetches the coin list data from the API.
 *
 * @param {Object} store - The Redux store to update with the fetched data.
 * @param {boolean} shouldIgnoreCache - A flag indicating whether to ignore the cache and attempt fetching data from the API. Defaults to false.
 * @returns {Promise<void>} - A promise that resolves when the store is updated and the cache is reinitialized.
 */
export const fetchUpdateAndReinitalizeCoinListCache = async (
  store,
  shouldIgnoreCache = false,
) => {
  console.log("fetchUpdateAndReinitalizeCoinListCache");

  let coinListCacheData;
  const state = store.getState();
  const currentCurrency = state.currency.currentCurrency;

  const cacheIsValid = await areNecessaryCachesValid();

  if (cacheIsValid && !shouldIgnoreCache) {
    try {
      const cacheData = await fetchDataFromIndexedDB(
        COINLISTS_TABLENAME,
        currentCurrency,
      );
      const currencyRatesCacheData = await fetchCurrencyDataFromIndexedDB(
        CURRENCYRATES_TABLENAME,
      );

      if (cacheData?.coinData) {
        coinListCacheData = {
          coins: {
            ...state.coins,
            displayedCoinListCoins: cacheData.coinData,
            coinListCoinsByCurrency: {
              ...state.coins.coinListCoinsByCurrency,
              [currentCurrency]: cacheData.coinData,
            },
            trendingCarouselCoins: cacheData.coinData,
          },
          currency: {
            ...state.currency,
            currencyRates: currencyRatesCacheData,
          },
        };
        console.log("cache USED for fetchDataForCoinListCacheInitialization");
      } else {
        throw new Error("No valid data in cache");
      }
    } catch (error) {
      console.error("Error fetching from cache:", error);
      coinListCacheData = await fetchDataForCoinListCacheInitialization(
        currentCurrency,
      );
      storeCurrencyRatesInIndexedDB(coinListCacheData.currency.currencyRates);
    }
  } else {
    console.log("cache NOT used for fetchDataForCoinListCacheInitialization");
    coinListCacheData = await fetchDataForCoinListCacheInitialization(
      currentCurrency,
    );
    storeCurrencyRatesInIndexedDB(coinListCacheData.currency.currencyRates);
  }

  updateStoreData(store, coinListCacheData);
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
  let shouldResetCache = await areNecessaryCachesValid(
    serverGlobalCacheVersion,
  );

  if (shouldResetCache) {
    const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");
    console.log("Cache Reset");
    console.log("serverGlobalCacheVersion", serverGlobalCacheVersion);
    console.log("clientGlobalCacheVersion", clientGlobalCacheVersion);

    // Clear all caches
    await clearAllCaches();

    // Reset the Redux store completely
    initializeStore();

    const newGlobalCacheVersion =
      serverGlobalCacheVersion !== clientGlobalCacheVersion
        ? serverGlobalCacheVersion
        : currentTime.toString();

    Cookie.set("globalCacheVersion", newGlobalCacheVersion, {
      expires: GLOBALCACHEVERSION_COOKIE_EXPIRY_TIME,
    });

    // If the server's cache version matches the client's, fetch fresh data and then update the store.
    if (serverGlobalCacheVersion === clientGlobalCacheVersion) {
      await fetchUpdateAndReinitalizeCoinListCache(store, true);
    }
  }
};
