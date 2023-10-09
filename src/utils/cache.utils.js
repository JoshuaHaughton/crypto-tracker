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
import { coinsActions } from "../store/coins";
import { appInfoActions } from "../store/appInfo";

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
 * Saves coin data to IndexedDB for a specific currency.
 *
 * @param {string} tableName - The name of the table in the IndexedDB where the coin data should be stored.
 * @param {string} currency - The currency identifier under which the coin data should be stored.
 * @param {Object} coinData - The data related to the specified currency that needs to be stored.
 *
 * @returns {Promise<void>} - Resolves when the data is successfully saved.
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
        coinData: {
          ...(existingCoinData.coinData || {}), // spread existing coinData if it exists
          [coinSymbol]: coinData,
        },
      };

      // Add the currency property to the mergedCoinData object for indexedDB queries
      mergedCoinData.currency = currency;

      // Store the merged data back into the database
      await db[tableName].put(mergedCoinData, currency);
    } else if (tableName === COINLISTS_TABLENAME) {
      await db[tableName].put({ currency, coinData });
    } else if (tableName === CURRENCYRATES_TABLENAME) {
      await db[tableName].put({ currency, rates: coinData });
    }
  } catch (err) {
    console.error(
      `Error saving data to IndexedDB for ${currency} in ${tableName}`,
      err,
    );
  }
};

/**
 * Validates cache data for a given table name.
 *
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @returns {Promise<boolean>} Returns a promise that resolves to true if data is valid, else false.
 */
export const validateCacheDataForTable = async (tableName) => {
  console.log("validateCacheDataForTable", tableName);

  try {
    for (const currency of ALL_CURRENCIES) {
      const dataForCurrency = await fetchDataFromIndexedDB(tableName, currency);

      switch (tableName) {
        case COINLISTS_TABLENAME:
          // Validate CoinList data
          if (
            !dataForCurrency ||
            !Array.isArray(dataForCurrency.coinData) ||
            dataForCurrency.coinData.length === 0
          ) {
            console.warn(`Invalid coinList data for currency: ${currency}`);
            return false;
          }
          break;

        case CURRENCYRATES_TABLENAME:
          // Validate CurrencyRates data
          if (!dataForCurrency || !dataForCurrency.rates) {
            console.warn(
              `Invalid currencyRates data for currency: ${currency}`,
            );
            return false;
          }

          for (const rateCurrency in dataForCurrency.rates) {
            const rateValue = dataForCurrency.rates[rateCurrency];
            if (typeof rateValue !== "number" || isNaN(rateValue)) {
              console.warn(
                `Invalid currency rate value for ${rateCurrency} in ${currency}`,
              );
              return false;
            }
          }
          break;

        case COINDETAILS_TABLENAME:
          // Validate CoinDetails data
          if (!dataForCurrency || Object.keys(dataForCurrency).length < 2) {
            console.warn(`Invalid coinDetails data for currency: ${currency}`);
            return false;
          }

          for (const rateCurrency in dataForCurrency) {
            const rateValue = dataForCurrency.rates[rateCurrency];
            if (typeof rateValue !== "number" || isNaN(rateValue)) {
              console.warn(
                `Invalid currency rate value for ${rateCurrency} in ${currency}`,
              );
              return false;
            }
          }
          break;

        default:
          console.warn(`Unsupported table name: ${tableName}`);
          return false;
      }
    }

    return true;
  } catch (err) {
    console.error(
      `Error validating data for ${tableName} for all currencies:`,
      err,
    );
    return false;
  }
};

/**
 * Removes data for a given coin from the COINDETAILS table in the IndexedDB for all currencies.
 *
 * @param {string} coinId - The ID of the coin to remove.
 * @returns {Promise<void>} Returns a promise indicating success or failure of the removal operation.
 */
export const removeCoinDetailsFromIndexedDBForAllCurrencies = async (
  coinId,
) => {
  try {
    const removalPromises = ALL_CURRENCIES.map(async (currency) => {
      // Fetch the existing data for the currency
      const existingData = await fetchDataFromIndexedDB(
        COINDETAILS_TABLENAME,
        currency,
      );

      if (
        existingData &&
        existingData.coinData &&
        existingData.coinData[coinId]
      ) {
        // Remove the coin data from the existing data
        delete existingData.coinData[coinId];

        // Store the updated data back into the database
        await fetchDataFromIndexedDB(COINDETAILS_TABLENAME, currency).put(
          existingData,
        );

        console.log(
          `Data for coin ${coinId} and currency ${currency} removed from table ${COINDETAILS_TABLENAME}`,
        );
      }
    });

    await Promise.all(removalPromises);
  } catch (err) {
    console.error(
      `Error removing data for coin ${coinId} from ${COINDETAILS_TABLENAME} for all currencies:`,
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
  const isCoinListValid = await validateCacheDataForTable(COINLISTS_TABLENAME);
  if (!isCoinListValid) {
    console.warn("Invalid CoinList Cache");
    return false;
  }
  console.log("Valid CoinList Cache!");

  // Check if all IndexedDB CurrencyRates caches are valid
  const isCurrencyRatesValid = await validateCacheDataForTable(
    CURRENCYRATES_TABLENAME,
  );
  if (!isCurrencyRatesValid) {
    console.warn("Invalid CurrencyRates Cache");
    return false;
  }

  console.log("Valid CurrencyRates Cache!");
  return true;
};

/**
 * Clears cache from indexedDB, and cookies.
 */
export const clearAllCaches = async () => {
  console.warn("CLEARING ALL CACHES");
  await clearCacheForAllKeysInTable(COINLISTS_TABLENAME);
  await clearCacheForAllKeysInTable(COINDETAILS_TABLENAME);
  await clearCacheForAllKeysInTable(CURRENCYRATES_TABLENAME);
  Cookie.remove("preloadedCoins");
  console.log("Cache cleared for preloadedCoins");
  console.warn("ALL CACHES CLEARED");
};

/**
 * Validates the cache based on server's global cache version and clears it if it's invalid.
 *
 * @param {string} serverGlobalCacheVersion - The global cache version from the server (optional, and should not be provided by the client cookie).
 * @returns {Promise<boolean>} - Returns `true` if the cache is valid, otherwise `false` and the cache is cleared.
 */
export const validateAndClearCache = async (serverGlobalCacheVersion) => {
  const isCacheValid = await areNecessaryCachesValid(serverGlobalCacheVersion);
  console.log("areNecessaryCachesValid - validateAndClearCache", isCacheValid);

  if (!isCacheValid) {
    console.log("Cache is invalid. Clearing...");
    await clearAllCaches();
  } else {
    console.log("Cache is valid.");
  }

  return isCacheValid;
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
 * @param {boolean} indexedDBCacheIsValid - A flag indicating whether the cache is valid or not. If passed, will not do another indexedDB request.
 * @returns {Promise<void>} - A promise that resolves when the store is updated and the cache is reinitialized.
 */
export const fetchUpdateAndReinitalizeCoinListCache = async (
  store,
  indexedDBCacheIsValid,
) => {
  console.log("fetchUpdateAndReinitalizeCoinListCache");

  let coinListCacheData;
  const state = store.getState();
  const currentCurrency = state.currency.currentCurrency;

  const isCacheValid =
    indexedDBCacheIsValid != null
      ? indexedDBCacheIsValid
      : await areNecessaryCachesValid();

  if (isCacheValid) {
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
  store.dispatch(
    initializeCoinListCache({ indexedDBCacheIsValid: isCacheValid }),
  );
};

/**
 * Loads cached coin details for a given currency into Redux if available.
 *
 * @param {string} currency - The currency for which the cache needs to be loaded.
 * @param {function} dispatch - The dispatch method from the store.
 * @returns {Promise<void>} Returns a promise indicating success or failure.
 */
export const loadCachedCoinDetailsToRedux = async (currency, dispatch) => {
  try {
    const fetchedData = await fetchDataFromIndexedDB(
      COINDETAILS_TABLENAME,
      currency,
    );

    // Check if data exists and has coinData
    if (fetchedData && fetchedData.coinData) {
      dispatch(
        coinsActions.setCachedCoinDetailsForCurrency({
          currency,
          coinData: fetchedData.coinData,
        }),
      );
    } else if (fetchedData && !fetchedData.coinData) {
      // Data exists, but coinData is empty
      console.warn(
        `Fetched CoinDetails preloaded data for ${currency} is empty.`,
      );
    } else {
      // No data fetched
      console.warn(
        `No data found in CoinDetails preloaded cache for ${currency}.`,
      );
    }
  } catch (error) {
    console.error(
      `Error fetching CoinDetails preloaded data for ${currency}:`,
      error,
    );
  }
};

/**
 * Loads cached coin details for all supported currencies into Redux.
 *
 * Initiates the coin details preloading process and updates the app's state
 * to indicate the start of the preloading process. It then iterates through each
 * supported currency and attempts to load the cached coin details from IndexedDB
 * into the Redux store. Once the process completes for all currencies, the app's
 * state is updated again to indicate the end of the preloading process.
 *
 * @param {Object} dispatch - The dispatch method from the Redux store.
 * @returns {Promise<void>} Returns a promise indicating the success or failure of the loading operation.
 */
export const loadAllCachedCoinDetailsToRedux = async (dispatch) => {
  dispatch(appInfoActions.startCoinDetailsPreloading());

  // Iterate through each supported currency
  for (const currency of ALL_CURRENCIES) {
    try {
      await loadCachedCoinDetailsToRedux(currency, dispatch);
    } catch (error) {
      console.error(
        `Error attempting to load CoinDetails preloaded cache for currency ${currency} into Redux:`,
        error,
      );
    } finally {
      dispatch(appInfoActions.finishCoinDetailsPreloading());
    }
  }
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
  console.log("checkAndResetCache");
  if (await areNecessaryCachesValid(serverGlobalCacheVersion)) return;

  console.warn("Caches are not valid. Cache Reset - checkAndResetCache");

  // Clear all caches
  await clearAllCaches();

  const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");

  // If the server's cache version matches the client's, fetch fresh data and then update the store because the cache is invalid for some other reason than server expiry - like the version expiring on the client (coin page since we don't return a new GCV), or being malformed for some reason.
  if (serverGlobalCacheVersion === clientGlobalCacheVersion) {
    await fetchUpdateAndReinitalizeCoinListCache(store, false);

    const currentTime = Date.now().toString();
    Cookie.set("globalCacheVersion", currentTime, {
      expires: GLOBALCACHEVERSION_COOKIE_EXPIRY_TIME,
    });
  } else {
    // If the server's globalCacheVersion is different from the client, then it's because new data was fetched there. In that case, we should use the data to dispatch
    await store.dispatch(
      initializeCoinListCache({ indexedDBCacheIsValid: false }),
    );

    // Calculate expiry time for the cookie
    const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
    const timeLeftInDays =
      (serverGlobalCacheVersion + 5 * 60 * 1000 - Date.now()) /
      MILLISECONDS_IN_DAY;

    Cookie.set("globalCacheVersion", serverGlobalCacheVersion, {
      expires: timeLeftInDays,
    });
  }
};
