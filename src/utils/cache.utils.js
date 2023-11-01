import db from "./database";
import Cookie from "js-cookie";
import {
  ALL_CURRENCIES,
  COINDETAILS_TABLENAME,
  POPULARCOINSLISTS_TABLENAME,
  CURRENCYRATES_TABLENAME,
  FIVE_MINUTES_IN_MS,
  GLOBALCACHEINFO_TABLENAME,
} from "../global/constants";
import { getPopularCoinsCacheData } from "./api.utils";
import { initializePopularCoinsAndDetailsCache } from "../thunks/initializeCoinCacheThunk";
import { updateStoreData } from "./reduxStore.utils";
import { coinsActions } from "../store/coins";
import { appInfoActions } from "../store/appInfo";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { isEmpty, mergeWith } from "lodash";
import { mapPopularCoinsToShallowDetailedAttributes } from "./dataFormat.utils";
import { replaceArraysDeepMergeObjects } from "./global.utils";

// Validating/Updating Cache Data

/**
 * Validates cache data for a given table name. Doesn't handle the globalCacheInfo table, as that should be only used in the serviceWorker.
 *
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @returns {Promise<boolean>} Returns a promise that resolves to true if data is valid, else false.
 */
export async function validateCacheDataForTable(tableName) {
  console.log("validateCacheDataForTable", tableName);

  try {
    for (const currency of ALL_CURRENCIES) {
      const dataForCurrency = await fetchDataFromIndexedDB(tableName, currency);

      switch (tableName) {
        case POPULARCOINSLISTS_TABLENAME:
          // Validate PopularCoinsList data
          if (
            !dataForCurrency ||
            !Array.isArray(dataForCurrency.coinData) ||
            dataForCurrency.coinData.length === 0
          ) {
            console.warn(
              `Invalid popularCoinsList data for currency: ${currency}`,
            );
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
          break;

        default:
          console.warn(`Unsupported table name: ${tableName}`);
          return false;
      }
    }

    console.log(`${tableName} has valid data! - validateCacheDataForTable`);
    return true;
  } catch (err) {
    console.error(
      `Error validating data for ${tableName} for currency ${currency}`,
      err,
    );
    return false;
  }
}

/**
 * Checks if all of the necessary cache data in Cookies & IndexedDB is valid. Necessary caches are
 * globalCacheVersion, PopularCoinsList, & CurrencyRates
 *
 * @param {number} [serverGlobalCacheVersion] - The global cache version from the server (optional, and should not be
 * provided by the client cookie).
 * @returns {Promise<boolean>} - Returns `true` if all caches are valid, otherwise `false`.
 */
export async function validateNecessaryCaches(serverGlobalCacheVersion = 0) {
  console.log("validateNecessaryCaches");

  // Check if GlobalCacheVersion is valid
  let isClientGlobalCacheVersionValid = validateCurrentGlobalCacheVersion(
    serverGlobalCacheVersion,
  );

  if (!isClientGlobalCacheVersionValid) {
    return false;
  }

  // Check if all IndexedDB PopularCoinsList caches are valid
  const isPopularCoinsListValid = await validateCacheDataForTable(
    POPULARCOINSLISTS_TABLENAME,
  );
  if (!isPopularCoinsListValid) {
    return false;
  }

  // Check if all IndexedDB CurrencyRates caches are valid
  const isCurrencyRatesValid = await validateCacheDataForTable(
    CURRENCYRATES_TABLENAME,
  );
  if (!isCurrencyRatesValid) {
    return false;
  }

  console.log("Necessary caches are valid - validateNecessaryCaches");
  return true;
}

/**
 * Validates the necessary caches based on server's global cache version. If it's invalid, this also clears all caches (Does not reset them).
 *
 * @param {string} serverGlobalCacheVersion - The global cache version from the server (optional, and should not be provided by the client cookie).
 * @returns {Promise<boolean>} Returns `true` if the cache is valid, otherwise `false` and the cache is cleared.
 */
export async function validateNecessaryCachesAndClearAllIfInvalid(
  serverGlobalCacheVersion,
) {
  const isCacheValid = await validateNecessaryCaches(serverGlobalCacheVersion);
  console.log(
    "validateNecessaryCaches - validateNecessaryCachesAndClearAllIfInvalid",
    isCacheValid,
  );

  if (!isCacheValid) {
    console.log(
      "Cache is invalid. Clearing... - validateNecessaryCachesAndClearAllIfInvalid",
    );
    await clearAllCaches();
  } else {
    console.log(
      "Cache is valid. - validateNecessaryCachesAndClearAllIfInvalid",
    );
  }

  return isCacheValid;
}

/**
 * Validates the client's cache and reinitializes it if necessary.
 * This function is invoked on route changes to ensure the cache's
 * validity and freshness.
 *
 * The process involves:
 * - Checking if the client's cache is valid based on expiry & the provided server's global cache version.
 * - If the cache is deemed invalid, the function proceeds to clear all caches and reinitialize
 *   them with new data fetched from the server or from provided initial state.
 * - If the server provides new data for popular coins or individual coin details, the function
 *   updates the cache with this data, ensuring the client has the most recent data available.
 *
 * Note:
 * - The `globalCacheVersion` (GCV) represents a timestamp indicating the freshness of data. It's
 *   primarily used to determine if the client's cached data is still relevant.
 * - For individual coin details, the GCV is based on the last PopularCoins fetch and doesn't update
 *   for every individual coin data fetch.
 *
 * @param {Object} store - The Redux store to dispatch actions and access state.
 * @param {Object} initialReduxState - The initial Redux state provided by the server.
 * @param {string} serverGlobalCacheVersion - The global cache version timestamp from the server.
 * @returns {Promise<void>} Resolves when the cache validation and potential reinitialization process is complete.
 */
export async function validateAndReinitializeCacheOnRouteChange(
  store,
  initialReduxState,
  serverGlobalCacheVersion,
) {
  console.log("validateAndReinitializeCacheOnRouteChange");
  const cachesAreValid = await validateNecessaryCaches(
    serverGlobalCacheVersion,
  );

  const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");
  const hasNewPopularCoinsData =
    serverGlobalCacheVersion > clientGlobalCacheVersion &&
    !isEmpty(initialReduxState?.coins?.displayedPopularCoinsList);
  // We don't update the GCV when getting new CoinDetails from the server,
  // as the GCV is based on the last PopularCoins fetch
  const hasNewCoinDetailsData = !isEmpty(
    initialReduxState?.coins?.selectedCoinDetails,
  );

  if (!cachesAreValid) {
    console.warn(
      "Caches are not valid. Cache Reset - validateAndReinitializeCacheOnRouteChange",
    );
    // Clear all caches
    await clearAllCaches();

    if (hasNewPopularCoinsData) {
      console.warn(
        "Using New PopularCoinsLists Data to initialize cache - validateAndReinitializeCacheOnRouteChange",
      );
      // Initialize cache with PopularCoinsData from the server
      await store.dispatch(
        initializePopularCoinsAndDetailsCache({ indexedDBCacheIsValid: false }),
      );
      // Use the GCV from server on the client
      updateGlobalCacheVersion(serverGlobalCacheVersion);
    } else if (!cachesAreValid) {
      console.warn(
        "Fetching new PopularCoinsLists Data to initialize cache - validateAndReinitializeCacheOnRouteChange",
      );
      // Fetch new PopularCoinsData from API before initializing cache
      await fetchAndInitializeCoinsCache({
        store,
        indexedDBCacheIsValid: false,
      });
      // Reset GCV completely since we just fetched
      updateGlobalCacheVersion();
    }
  } else {
    console.warn(
      "Caches ARE valid! Cache NOT reset - validateAndReinitializeCacheOnRouteChange",
    );
  }

  // Preload CoinDetail Data regardless of cache validity, if we are on that page with new data from the server
  if (hasNewCoinDetailsData) {
    // New CoinDetail Data
    console.warn(
      "Using New CoinDetail Data to preload the cache - validateAndReinitializeCacheOnRouteChange",
    );
    await preloadDetailsForCurrentCoinIfOnDetailsPage(store, initialReduxState);
  }
}

/**
 * Checks if the current global cache version is valid compared to the server's version (if provided).
 *
 * @param {number} [serverGlobalCacheVersion] - The global cache version timestamp from the server (optional).
 * @returns {boolean} Returns true if the current global cache version is still valid, else false.
 */
export function validateCurrentGlobalCacheVersion(serverGlobalCacheVersion) {
  const currentTime = Date.now();
  const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");

  console.log("clientGlobalCacheVersion", clientGlobalCacheVersion);
  console.log("serverGlobalCacheVersion", serverGlobalCacheVersion);
  console.log(
    "currentTime - clientGlobalCacheVersion",
    currentTime - clientGlobalCacheVersion,
  );
  console.log("FIVE_MINUTES_IN_MS", FIVE_MINUTES_IN_MS);

  const dataDoesNotExist = !clientGlobalCacheVersion;
  const cacheIsOld =
    currentTime - Number(clientGlobalCacheVersion) > FIVE_MINUTES_IN_MS;
  const serverHasNewData =
    serverGlobalCacheVersion &&
    Number(serverGlobalCacheVersion) > Number(clientGlobalCacheVersion);

  // Logging the conditions for clarity
  if (dataDoesNotExist) {
    console.warn("Cache data doesn't exist.");
  }

  if (cacheIsOld) {
    console.warn("The client cache is more than 5 minutes old.");
  }

  if (serverHasNewData) {
    console.warn("The server has fetched new data.");
  }

  const shouldResetCache = dataDoesNotExist || cacheIsOld || serverHasNewData;

  if (shouldResetCache) {
    console.warn("Invalid GlobalCacheVersion");
    return false;
  }

  console.log("Valid GlobalCacheVersion!");
  return true;
}

/**
 * Updates the global cache version cookie with the current timestamp.
 *
 * @param {number} [serverGlobalCacheVersion] - An optional server timestamp to set as the cookie value.
 */
export function updateGlobalCacheVersion(serverGlobalCacheVersion) {
  console.log("updateGlobalCacheVersion");
  let valueToSet = Date.now().toString();

  if (serverGlobalCacheVersion) {
    valueToSet = serverGlobalCacheVersion.toString();

    // Calculate expiry time for the cookie
    const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;
    const timeLeftInDays =
      (serverGlobalCacheVersion + 5 * 60 * 1000 - Date.now()) /
      MILLISECONDS_IN_DAY;

    Cookie.set("globalCacheVersion", valueToSet, {
      expires: timeLeftInDays,
    });
  } else {
    Cookie.set("globalCacheVersion", valueToSet);
  }

  // Save GCV to IndexedDB so that we can access it in the serviceWorker
  storeGlobalCacheVersionInIndexedDB(valueToSet);

  console.warn("globalCacheVersion updated", valueToSet);
}

/**
 * Updates the global cache version cookie with the current timestamp or
 * with the provided server's global cache version, if the current value is not valid.
 *
 * @param {number} [serverGlobalCacheVersion] - An optional server timestamp to set as the cookie value.
 */
export function updateGlobalCacheVersionIfNecessary(serverGlobalCacheVersion) {
  console.log("updateGlobalCacheVersionIfNecessary");

  if (validateCurrentGlobalCacheVersion(serverGlobalCacheVersion)) {
    console.log("Current globalCacheVersion is still valid. Not updating.");
    return;
  }

  updateGlobalCacheVersion(serverGlobalCacheVersion);
}

// Adding to Cache

/**
 * Saves data to IndexedDB for a specific table and currency.
 *
 * @param {string} tableName - The name of the table in the IndexedDB where the coin data should be stored.
 * @param {string} currency - The currency identifier under which the coin data should be stored.
 * @param {Object} coinData - The data related to the specified currency that needs to be stored.
 *
 * @returns {Promise<void>} - Resolves when the data is successfully saved.
 */
export async function saveTableDataForCurrencyInIndexedDB(
  tableName,
  currency,
  coinData,
) {
  try {
    if (tableName === COINDETAILS_TABLENAME) {
      // Get the existing coin data for the specified currency
      const existingCoinData =
        (await db[tableName].get(currency))?.coinData || {};

      // Get the coin's symbol from the data
      const coinSymbol = coinData?.coinAttributes?.id;

      // Construct the data to merge based on the existence of coinSymbol
      const dataToMerge = coinSymbol ? { [coinSymbol]: coinData } : coinData;

      // Use mergeWith for both individual coin and entire data
      const mergedCoinData = mergeWith(
        {},
        existingCoinData,
        dataToMerge,
        replaceArraysDeepMergeObjects,
      );

      // Store the merged data back into the database
      await db[tableName].put({ currency, coinData: mergedCoinData });
    } else if (tableName === POPULARCOINSLISTS_TABLENAME) {
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
}

/**
 * Stores currency rates in IndexedDB cache.
 *
 * @param {Object} currencyRates - The currency rates data to be stored.
 * @returns {Promise<void>} - Returns a promise that resolves when all storage operations are complete.
 */
export function storeCurrencyRatesInIndexedDB(currencyRates) {
  const storagePromises = [];

  for (const key of Object.keys(currencyRates)) {
    const promise = saveTableDataForCurrencyInIndexedDB(
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
}

/**
 * Stores data to the GlobalCacheInfo table in IndexedDB.
 *
 * @async
 * @function
 * @param {string} currency - The current currency value to be saved.
 * @throws Will throw an error if saving to IndexedDB fails.
 */
export async function storeGlobalCacheInfoInIndexedDB({ key, value }) {
  try {
    await db[GLOBALCACHEINFO_TABLENAME].put({ key, value });
  } catch (err) {
    console.error(`Error saving ${key} to IndexedDB`, err);
  }
}

/**
 * Saves the current currency to IndexedDB.
 *
 * @async
 * @function
 * @param {string} currency - The current currency value to be saved.
 * @throws Will throw an error if saving to IndexedDB fails.
 */
export async function storeCurrentCurrencyInIndexedDB(currency) {
  await storeGlobalCacheInfoInIndexedDB({
    key: "currentCurrency",
    value: currency,
  });
}

/**
 * Saves the global cache version to IndexedDB.
 *
 * @async
 * @function
 * @param {string} cacheVersion - The current global cache version value to be saved.
 * @throws Will throw an error if saving to IndexedDB fails.
 */
export async function storeGlobalCacheVersionInIndexedDB(cacheVersion) {
  await storeGlobalCacheInfoInIndexedDB({
    key: "globalCacheVersion",
    value: cacheVersion,
  });
}

/**
 * Checks the validity of the popular coins list cache and updates it if necessary.
 *
 * This function performs the following steps:
 *
 * - If `options.indexedDBCacheIsValid` is explicitly passed:
 *   - Uses the provided value to determine the cache's validity without checking IndexedDB.
 *
 * - If `options.indexedDBCacheIsValid` is not provided (i.e., `undefined`):
 *   - Checks if the popular coins list cache in IndexedDB is valid.
 *
 * - If the cache is valid:
 *   - Attempts to fetch the coin list data from the cache.
 *   - If fetching from the cache fails or the data is invalid, fetches from the API and updates the cache.
 *
 * - If the cache is not valid:
 *   - Fetches the coin list data directly from the API.
 *   - Updates the global cache version.
 *   - Updates the cache with the newly fetched data.
 *
 * - Updates the Redux store with the appropriate data (either from the cache or the API).
 *
 * @param {Object} options - The options object.
 * @param {Object} options.store - The Redux store to update with the fetched data.
 * @param {boolean} [options.indexedDBCacheIsValid] - Optional. If provided, it directly indicates whether the IndexedDB cache is valid or not, bypassing any IndexedDB validity check. If left undefined, the function will check the validity from IndexedDB.
 * @returns {Promise<void>} - A promise that resolves when the store is updated and the cache is reinitialized.
 */
export async function fetchAndInitializeCoinsCache({
  store,
  indexedDBCacheIsValid,
}) {
  console.log("fetchAndInitializeCoinsCache");

  let popularCoinsListCacheData;
  const state = store.getState();
  const currentCurrency = state.currency.currentCurrency;
  const selectedCoinDetails = state.coins.selectedCoinDetails;
  const isCoinCurrentlySelected = !isEmpty(selectedCoinDetails);

  const isCacheValid =
    indexedDBCacheIsValid != null
      ? indexedDBCacheIsValid
      : await validateNecessaryCaches();

  if (isCacheValid) {
    try {
      const popularCoinsListByCurrency = {};
      const cachedCoinDetailsByCurrency = {};

      // Fetch popular coins data concurrently for all currencies
      const allCurrenciesData = await Promise.all(
        ALL_CURRENCIES.map(async (currency) => {
          const { coinData } = await fetchDataFromIndexedDB(
            POPULARCOINSLISTS_TABLENAME,
            currency,
          );
          return { currency, coinData };
        }),
      );

      allCurrenciesData.forEach(({ currency, coinData }) => {
        popularCoinsListByCurrency[currency] = coinData;
        cachedCoinDetailsByCurrency[currency] =
          mapPopularCoinsToShallowDetailedAttributes(coinData);
        if (isCoinCurrentlySelected) {
          const coinId = selectedCoinDetails.coinAttributes.id;
          delete cachedCoinDetailsByCurrency[currency][coinId];
        }
      });

      const currencyRatesCacheData = await fetchDataForCurrenciesFromIndexedDB(
        CURRENCYRATES_TABLENAME,
      );

      popularCoinsListCacheData = {
        coins: {
          displayedPopularCoinsList:
            popularCoinsListByCurrency[currentCurrency],
          trendingCarouselCoins: popularCoinsListByCurrency[
            currentCurrency
          ]?.slice(0, 10),
          popularCoinsListByCurrency,
          cachedCoinDetailsByCurrency,
        },
        currency: {
          currencyRates: currencyRatesCacheData,
        },
      };
      console.log("cache USED for getPopularCoinsCacheData");
    } catch (error) {
      console.error("Error fetching from cache:", error);
      popularCoinsListCacheData = await getPopularCoinsCacheData(
        currentCurrency,
      );
      storeCurrencyRatesInIndexedDB(
        popularCoinsListCacheData.currency.currencyRates,
      );
    }
  } else {
    console.log("cache NOT used for getPopularCoinsCacheData");
    popularCoinsListCacheData = await getPopularCoinsCacheData(currentCurrency);
    updateGlobalCacheVersion();
    storeCurrencyRatesInIndexedDB(
      popularCoinsListCacheData.currency.currencyRates,
    );
  }

  updateStoreData(store, popularCoinsListCacheData);
  await store.dispatch(
    initializePopularCoinsAndDetailsCache({
      indexedDBCacheIsValid: isCacheValid,
    }),
  );
}

// Preloading

/**
 * Preloads the details for the currently selected coin if on its details page.
 *
 * This function checks if the details for the selected coin are present in the initial Redux state.
 * If present, it verifies the coin isn't already preloaded (by checking the "preloadedCoins" cookie).
 * If the coin isn't already preloaded, it preloads the coin details into the cache.
 *
 * @param {Object} store - The Redux store.
 * @param {Object} initialReduxState - The initial Redux state from the server.
 * @returns {Promise<void>}
 */
export async function preloadDetailsForCurrentCoinIfOnDetailsPage(
  store,
  initialReduxState,
) {
  const selectedCoinDetails = initialReduxState?.coins?.selectedCoinDetails;
  const { currentCurrency, currencyRates } = store.getState().currency;

  const preloadedCoinIds = JSON.parse(
    localStorage?.getItem("preloadedCoins") || "[]",
  );
  const coinIsAlreadyPreloaded =
    selectedCoinDetails?.chartValues != null &&
    preloadedCoinIds.includes(selectedCoinDetails.coinAttributes?.id);

  if (
    !isEmpty(selectedCoinDetails) &&
    selectedCoinDetails.coinAttributes &&
    !coinIsAlreadyPreloaded
  ) {
    console.log(
      "We started with CoinDetails data, meaning it's new data from the server. Let's preload that.",
    );
    await preloadCoinDetails(
      store.dispatch,
      selectedCoinDetails,
      currentCurrency,
      currencyRates,
    );
  } else {
    if (coinIsAlreadyPreloaded) {
      console.warn("The coin is already preloaded.");
    } else {
      console.warn(
        "We did not start with CoinDetails data from the server (We aren't on the CoinDetails page).",
      );
    }
  }
}

/**
 * Preloads coin details by:
 * - Sending a message to the currency transformer worker to transform details for all currencies.
 * - Updating the Redux state with the fetched data for the current currency.
 * - Saving the data for the current currency to IndexedDB.
 * - Updating a cookie that tracks preloaded coins.
 *
 * @param {Object} dispatch - The dispatch method from the Redux store.
 * @param {Object} coinDetails - The details of the coin to preload.
 * @param {string} currentCurrency - The current currency.
 * @param {Object} currencyRates - Currency conversion rates.
 * @returns {Promise<void>}
 */
export async function preloadCoinDetails(
  dispatch,
  coinDetails,
  currentCurrency,
  currencyRates,
) {
  const coinId = coinDetails.coinAttributes.id;
  console.warn(`Preloading details for coin ${coinId}`, coinDetails);

  try {
    postMessageToCurrencyTransformerWorker({
      type: "transformAllCoinDetailsCurrencies",
      data: {
        coinToTransform: coinDetails,
        fromCurrency: currentCurrency.toUpperCase(),
        currencyRates,
        currenciesToExclude: [currentCurrency.toUpperCase()],
      },
    });

    await saveTableDataForCurrencyInIndexedDB(
      COINDETAILS_TABLENAME,
      currentCurrency,
      coinDetails,
    );

    // Confirm that the data is saved in IndexedDB
    const savedData = await getCoinDetailsForCurrencyByIdFromBrowser(
      currentCurrency,
      coinId,
    );

    if (!savedData || savedData.coinAttributes.id !== coinId) {
      console.error(`Failed to confirm save in IndexedDB for coin ${coinId}`);
      return;
    }

    dispatch(
      coinsActions.mergeCachedCoinDetailsForCurrency({
        currency: currentCurrency,
        coinData: coinDetails,
      }),
    );

    let currentPreloadedCoinIds = JSON.parse(
      localStorage?.getItem("preloadedCoins") || "[]",
    );

    if (!currentPreloadedCoinIds.includes(coinId)) {
      currentPreloadedCoinIds.push(coinId);
      localStorage?.setItem(
        "preloadedCoins",
        JSON.stringify(currentPreloadedCoinIds),
      );
    }
  } catch (error) {
    console.error(`Error during preload operation for coin ${coinId}:`, error);
  }
}

// Retrieving Data from Cache

/**
 * Fetches data from indexedDB cache.
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @param {string} key - The key for the data to be fetched.
 * @returns {Promise<any>} - Returns a promise that resolves to the fetched data or `null` if not found.
 */
export async function fetchDataFromIndexedDB(tableName, key) {
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
}

/**
 * Fetches coinDetails for a specific currency and coin ID from indexedDB cache.
 *
 * @param {string} currency - The currency for which coin data is to be fetched.
 * @param {string} coinId - The ID of the coin to be fetched.
 * @returns {Promise<any>} - Returns a promise that resolves to the fetched coin data or `null` if not found.
 */
export async function getCoinDetailsForCurrencyByIdFromBrowser(
  currency,
  coinId,
) {
  try {
    const coinDetailsForCurrency = await db[COINDETAILS_TABLENAME].get(
      currency,
    );
    if (
      coinDetailsForCurrency &&
      coinDetailsForCurrency.coinData &&
      coinDetailsForCurrency.coinData[coinId]
    ) {
      return coinDetailsForCurrency.coinData[coinId];
    } else {
      return null;
    }
  } catch (err) {
    console.error(
      `Error fetching coin data from IndexedDB for currency ${currency} and coin ID ${coinId}:`,
      err,
    );
    return null;
  }
}

/**
 * Hydrates coin-related data (PopularCoinsList, Shallow CoinDetails, & Preloaded CoinDetails)
 * from the optimal available source.
 *
 * 1. Prioritizes using initial popularCoinsList data provided by the server.
 * 2. If the server data is unavailable, checks the IndexedDB cache.
 * 3. If the data isn't found in the cache either, fetches it via an API call.
 *
 * Once the PopularCoinsList data is obtained, it uses them to compute Shallow CoinDetails
 * and store them in Redux (Not IndexedDB). Finally, we check/use IndexedDB to fetch & hydrate
 * any avaliable preloaded coins from the cache.
 *
 * @param {Object} store - The Redux store to update with the fetched data.
 * @param {boolean} isCacheValid - Flag indicating the validity of the cache.
 * @param {string} [serverGlobalCacheVersion] - Optional. The server's global cache version. Shouldn't be provided by client cookies.
 * @returns {Promise<void>} - A promise indicating completion.
 */
export async function hydrateCoinsCacheFromAvailableSources(
  store,
  isCacheValid,
  serverGlobalCacheVersion,
) {
  console.log("hydrateCoinsCacheFromAvailableSources");
  const popularCoinsList = store.getState().coins.displayedPopularCoinsList;

  // Handle the case where no popularCoinsList data is available
  if (!Array.isArray(popularCoinsList) || popularCoinsList.length === 0) {
    console.log(
      "We didn't start with PopularCoinsLists data from the server so we need to fetch it from the cache or API.",
    );
    await fetchAndInitializeCoinsCache({
      store,
      indexedDBCacheIsValid: isCacheValid,
    });
    store.dispatch(appInfoActions.finishPopularCoinsListsHydration());
  } else {
    console.log(
      "We started with PopularCoinsLists data from the server. DON'T FETCH IT AGAIN, just initialize the cache with it.",
    );
    await store.dispatch(
      initializePopularCoinsAndDetailsCache({
        indexedDBCacheIsValid: isCacheValid,
      }),
    );
    updateGlobalCacheVersion(serverGlobalCacheVersion);
    store.dispatch(appInfoActions.finishPopularCoinsListsHydration());
  }

  await hydratePreloadedCoinsFromCacheIfAvailable(store.dispatch);
}

/**
 * Fetches data for multiple currencies from IndexedDB cache.
 *
 * @param {string} tableName - The name of the table in IndexedDB.
 * @param {string[]} currencyKeys - An array of currency keys to fetch data for.
 * @returns {Promise<{ [key: string]: any }>} - Returns a promise that resolves to an object
 *   where each key is a currency key and the corresponding value is the fetched data, or `null` if not found.
 */
export async function fetchDataForCurrenciesFromIndexedDB(
  tableName,
  currencyKeys = ALL_CURRENCIES,
) {
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
}

/**
 * Loads all available cached preloaded coinDetails for all supported currencies from IndexedDB into Redux.
 *
 * Initiates the coin details preloading process and updates the app's state
 * to indicate the start of the CoinDetails preloading process. It then iterates through each
 * supported currency and attempts to load the cached coin details from IndexedDB
 * into the Redux store. Once the process completes for all currencies, the app's
 * state is updated again to indicate the end of the CoinDetails preloading process.
 *
 * @param {Object} dispatch - The dispatch method from the Redux store.
 * @returns {Promise<void>} Returns a promise indicating the success or failure of the CoinDetails loading operation.
 */
export async function hydratePreloadedCoinsFromCacheIfAvailable(dispatch) {
  dispatch(appInfoActions.startCoinDetailsHydration());

  // Iterate through each supported currency
  for (const currency of ALL_CURRENCIES) {
    try {
      await hydrateReduxWithPreloadedCoinsForCurrency(currency, dispatch);
    } catch (error) {
      console.error(
        `Error attempting to load CoinDetails preloaded cache for currency ${currency} into Redux:`,
        error,
      );
    } finally {
      dispatch(appInfoActions.finishCoinDetailsHydration());
    }
  }
}

/**
 * Loads cached coin details for a given currency into Redux if available.
 *
 * @param {string} currency - The currency for which the cache needs to be loaded.
 * @param {function} dispatch - The dispatch method from the store.
 * @returns {Promise<void>} Returns a promise indicating success or failure.
 */
export async function hydrateReduxWithPreloadedCoinsForCurrency(
  currency,
  dispatch,
) {
  console.log("hydrateReduxWithPreloadedCoinsForCurrency");
  try {
    const fetchedData = await fetchDataFromIndexedDB(
      COINDETAILS_TABLENAME,
      currency,
    );

    // Check if data exists and has coinData
    if (fetchedData && fetchedData.coinData) {
      console.log(`Preloaded Coin Data exists for ${currency}: ${fetchedData}`);
      dispatch(
        coinsActions.mergeCachedCoinDetailsForCurrency({
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
      console.log(`No preloaded CoinDetails data in cache for ${currency}.`);
    }
  } catch (error) {
    console.error(
      `Error fetching CoinDetails preloaded data for ${currency}:`,
      error,
    );
  }
}

// Clearing/Deleting Caches

/**
 * Clears cache for a specific table and key.
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @param {string} key - The key for which to clear the cache.
 */
export async function clearCache(tableName, key) {
  try {
    await db[tableName].delete(key);
    console.log(`Cache cleared from IndexedDB for ${key} in ${tableName}`);
  } catch (err) {
    console.error(
      `Error clearing cache from IndexedDB for ${key} in ${tableName}:`,
      err,
    );
  }
}

/**
 * Clears cache for a specific table.
 * @param {string} tableName - The name of the table in the IndexedDB.
 */
export async function clearCacheForTable(tableName) {
  try {
    await db[tableName].clear();
    console.log(`Cache cleared from IndexedDB for all keys in ${tableName}`);
  } catch (err) {
    console.error(
      `Error clearing cache from IndexedDB for all keys in ${tableName}:`,
      err,
    );
  }
}

/**
 * Deletes coin data for a specific currency and coin ID from indexedDB cache.
 *
 * @param {string} currency - The currency for which coin data is to be deleted.
 * @param {string} coinId - The ID of the coin to be deleted.
 * @returns {Promise<void>} - Returns a promise that resolves when the coin data is deleted.
 */
export async function deleteCoinDetailsByIdForCurrencyFromIndexedDb(
  currency,
  coinId,
) {
  try {
    const coinDetailsForCurrency = await db[COINDETAILS_TABLENAME].get(
      currency,
    );
    if (
      coinDetailsForCurrency &&
      coinDetailsForCurrency.coinData &&
      coinDetailsForCurrency.coinData[coinId]
    ) {
      delete coinDetailsForCurrency.coinData[coinId];
      await db[tableName].put(coinDetailsForCurrency, currency);
    }
  } catch (err) {
    console.error(
      `Error deleting coin data from IndexedDB for currency ${currency} and coin ID ${coinId}:`,
      err,
    );
  }
}

/**
 * Clears cache from indexedDB, and cookie.
 */
export async function clearAllCaches() {
  console.warn("CLEARING ALL CACHES");
  await clearCacheForTable(POPULARCOINSLISTS_TABLENAME);
  await clearCacheForTable(COINDETAILS_TABLENAME);
  await clearCacheForTable(CURRENCYRATES_TABLENAME);
  localStorage?.removeItem("preloadedCoins");
  console.log("Cache cleared for preloadedCoins");
  console.warn("ALL CACHES CLEARED");
}
