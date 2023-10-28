import db from "./database";
import {
  ALL_CURRENCIES,
  COINDETAILS_TABLENAME,
  POPULARCOINSLISTS_TABLENAME,
  CURRENCYRATES_TABLENAME,
  MAXIMUM_PRELOADED_COIN_COUNT,
  FIVE_MINUTES_IN_MS,
} from "../global/constants";
import Cookie from "js-cookie";
import { fetchCoinDetailsData, getPopularCoinsCacheData } from "./api.utils";
import { initializePopularCoinsListCache } from "../thunks/popularCoinsListCacheThunk";
import { updateStoreData } from "./store.utils";
import { coinsActions } from "../store/coins";
import { appInfoActions } from "../store/appInfo";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { isEmpty } from "lodash";

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
        initializePopularCoinsListCache({ indexedDBCacheIsValid: false }),
      );
      // Use the GCV from server on the client
      updateGlobalCacheVersion(serverGlobalCacheVersion);
    } else if (!cachesAreValid) {
      console.warn(
        "Fetching new PopularCoinsLists Data to initialize cache - validateAndReinitializeCacheOnRouteChange",
      );
      // Fetch new PopularCoinsData from API before initializing cache
      await fetchUpdateAndReinitalizePopularCoinsListCache({
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
    await preloadDetailsForCurrentCoinIfOnDetailsPage(store);
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
  saveGlobalCacheVersionInIndexedDB(valueToSet);

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
 * Saves coin data to IndexedDB for a specific currency.
 *
 * @param {string} tableName - The name of the table in the IndexedDB where the coin data should be stored.
 * @param {string} currency - The currency identifier under which the coin data should be stored.
 * @param {Object} coinData - The data related to the specified currency that needs to be stored.
 *
 * @returns {Promise<void>} - Resolves when the data is successfully saved.
 */
export async function saveCoinDataForCurrencyInBrowser(
  tableName,
  currency,
  coinData,
) {
  try {
    if (tableName === COINDETAILS_TABLENAME) {
      // Get the existing coin data for the specified currency
      const existingCoinData = (await db[tableName].get(currency)) || {};

      // Get the coin's symbol from the data
      const coinSymbol = coinData.coinAttributes.symbol;

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
 * Saves the current currency to IndexedDB.
 *
 * @async
 * @function
 * @param {string} currency - The current currency value to be saved.
 * @throws Will throw an error if saving to IndexedDB fails.
 */
export async function saveCurrentCurrencyInBrowser(currency) {
  try {
    await db.globalCacheInfo.put({ key: "currentCurrency", value: currency });
  } catch (err) {
    console.error("Error saving current currency to IndexedDB", err);
  }
}

/**
 * Saves the global cache version to IndexedDB.
 *
 * @async
 * @function
 * @param {string} cacheVersion - The current global cache version value to be saved.
 * @throws Will throw an error if saving to IndexedDB fails.
 */
export async function saveGlobalCacheVersionInIndexedDB(cacheVersion) {
  try {
    await db.globalCacheInfo.put({
      key: "globalCacheVersion",
      value: cacheVersion,
    });
  } catch (err) {
    console.error("Error saving global cache version to IndexedDB", err);
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
}

/**
 * Fetches new PopularCoinsList Data, updates the Redux store, and then reinitializes the PopularCoinsList Cache.
 *
 * If `options.shouldIgnoreCache` is set to false, the function checks the cache and attempts to fetch the coin list data from it.
 * If the cache fetch fails or returns invalid data, it logs an error and proceeds to fetch from the API.
 *
 * If `options.shouldIgnoreCache` is set to true, the function directly fetches the coin list data from the API.
 *
 * If new data was fetched from the API, the globalCacheVersion is updated accordingly.
 *
 * @param {Object} options - The options object.
 * @param {Object} options.store - The Redux store to update with the fetched data.
 * @param {boolean} options.indexedDBCacheIsValid - A flag indicating whether the cache is valid or not. If passed, will not do another indexedDB request.
 * @returns {Promise<void>} - A promise that resolves when the store is updated and the cache is reinitialized.
 */
export async function fetchUpdateAndReinitalizePopularCoinsListCache({
  store,
  indexedDBCacheIsValid,
}) {
  console.log("fetchUpdateAndReinitalizePopularCoinsListCache");

  let popularCoinsListCacheData;
  const state = store.getState();
  const currentCurrency = state.currency.currentCurrency;

  const isCacheValid =
    indexedDBCacheIsValid != null
      ? indexedDBCacheIsValid
      : await validateNecessaryCaches();

  if (isCacheValid) {
    try {
      const cacheData = await fetchDataFromIndexedDB(
        POPULARCOINSLISTS_TABLENAME,
        currentCurrency,
      );
      const currencyRatesCacheData = await fetchCurrencyDataFromIndexedDB(
        CURRENCYRATES_TABLENAME,
      );

      if (cacheData?.coinData) {
        popularCoinsListCacheData = {
          coins: {
            displayedPopularCoinsList: cacheData.coinData,
            popularCoinsListByCurrency: {
              [currentCurrency]: cacheData.coinData,
            },
            trendingCarouselCoins: cacheData.coinData.slice(0, 10),
          },
          currency: {
            currencyRates: currencyRatesCacheData,
          },
        };
        console.log("cache USED for getPopularCoinsCacheData");
      } else {
        throw new Error("No valid data in cache");
      }
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
  return store.dispatch(
    initializePopularCoinsListCache({ indexedDBCacheIsValid: isCacheValid }),
  );
}

// Preloading

/**
 * Preloads the details for the currently selected coin if on its details page.
 *
 * This function checks if the details for the selected coin are present and then preloads them into the cache.
 * This preloading is particularly intended for when the user is on the coin's details page.
 *
 * @param {Object} store - The Redux store.
 * @returns {Promise<void>}
 */
export async function preloadDetailsForCurrentCoinIfOnDetailsPage(store) {
  const selectedCoinDetails = store.getState().coins.selectedCoinDetails;
  const currentCurrency = store.getState().currency.currentCurrency;
  const currencyRates = store.getState().currency.currencyRates;
  if (
    Object.keys(selectedCoinDetails).length > 0 &&
    selectedCoinDetails.coinAttributes
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
    console.log("We did not start with CoinDetails data from server.");
  }
}

/**
 * Fetches coin details and preloads them. This function takes care of the following:
 * - Ensures the coin isn't already being fetched.
 * - Checks the current state of the cache to get preloaded coins.
 * - Determines if fetching this coin would exceed the maximum count limit.
 * - If the limit would be exceeded, it removes the earliest added coin from IndexedDB and the cache.
 * - Fetches and preloads coin details.
 *
 * @param {string} coinId - The ID of the coin to be fetched and preloaded.
 * @param {Array<string>} coinsBeingFetched - List of coin IDs currently being fetched.
 * @param {string} currentCurrency - The current currency in use.
 * @param {Object} currencyRates - Currency conversion rates.
 * @param {Function} dispatch - The dispatch method from the Redux store.
 * @returns {Promise<void>}
 */
export async function fetchAndPreloadCoin(
  coinId,
  coinsBeingFetched,
  currentCurrency,
  currencyRates,
  dispatch,
) {
  // Check if the coin is currently being fetched.
  if (coinsBeingFetched.includes(coinId)) {
    console.error(`Coin ${coinId} is currently being fetched.`);
    return;
  }

  // Get the current preloaded coin IDs from the cache.
  let currentPreloadedCoinIds = JSON.parse(
    localStorage?.getItem("preloadedCoins") || "[]",
  );

  // Check if fetching this coin would exceed the maximum preloaded coin count.
  if (
    currentPreloadedCoinIds.length + coinsBeingFetched.length >=
    MAXIMUM_PRELOADED_COIN_COUNT
  ) {
    // Remove the earliest added coin from the list.
    const coinToRemove = currentPreloadedCoinIds.shift();

    // Remove that coin's data from IndexedDB.
    await deleteCoinDataForCurrencyByIdFromBrowser(
      COINDETAILS_TABLENAME,
      currentCurrency,
      coinToRemove,
    );

    // Update the cache with the new list of preloaded coins.
    localStorage?.setItem(
      "preloadedCoins",
      JSON.stringify(currentPreloadedCoinIds),
    );
    console.warn(
      `Removed earliest added coin ${coinToRemove} to make space for new coins.`,
    );
  }

  // Mark the coin as being fetched to prevent duplicate fetches.
  dispatch(appInfoActions.addCoinBeingFetched({ coinId }));

  try {
    // Fetch the detailed data for the coin.
    const detailedData = await fetchCoinDetailsData(coinId, currentCurrency);
    if (detailedData == null) return;

    // Extract the initial rates from the detailed data.
    const { currencyRates, ...dataWithoutCurrencyRates } = detailedData;

    // Preload the coin details.
    await preloadCoinDetails(
      dispatch,
      dataWithoutCurrencyRates,
      currentCurrency,
      currencyRates,
    );
  } catch (error) {
    console.error("Error preloading coin data:", error);
  } finally {
    // Mark the coin as no longer being fetched.
    dispatch(appInfoActions.removeCoinBeingFetched({ coinId }));
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

    await saveCoinDataForCurrencyInBrowser(
      COINDETAILS_TABLENAME,
      currentCurrency,
      coinDetails,
    );

    // Confirm that the data is saved in IndexedDB
    const savedData = await getCoinDataForCurrencyByIdFromBrowser(
      COINDETAILS_TABLENAME,
      currentCurrency,
      coinId,
    );

    if (!savedData || savedData.coinAttributes.id !== coinId) {
      console.error(`Failed to confirm save in IndexedDB for coin ${coinId}`);
      return;
    }

    dispatch(
      coinsActions.setCachedCoinDetailsByCurrency({
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
 * Fetches coin data for a specific currency and coin ID from indexedDB cache.
 *
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @param {string} currency - The currency for which coin data is to be fetched.
 * @param {string} coinId - The ID of the coin to be fetched.
 * @returns {Promise<any>} - Returns a promise that resolves to the fetched coin data or `null` if not found.
 */
export async function getCoinDataForCurrencyByIdFromBrowser(
  tableName,
  currency,
  coinId,
) {
  try {
    const coinDataForCurrency = await db[tableName].get(currency);
    if (
      coinDataForCurrency &&
      coinDataForCurrency.coinData &&
      coinDataForCurrency.coinData[coinId]
    ) {
      return coinDataForCurrency.coinData[coinId];
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
 * Hydrates the PopularCoinsList data from the best available source.
 *
 * The function first checks for initial popularCoinsList data from the server. If unavailable, it then checks the IndexedDB cache.
 * If the data is also not in the cache, it fetches the PopularCoinsList data via an API call.
 * This ensures that the PopularCoinsList is always hydrated with the most readily available data.
 *
 * @param {Object} store - The Redux store.
 * @param {boolean} isCacheValid - Indicates whether the cache is valid or not.
 * @param {string} serverGlobalCacheVersion - The global cache version from the server (optional, and should not be provided by the client cookie).
 * @returns {Promise<void>}
 */
export async function hydratePopularCoinsListFromAvailableSources(
  store,
  isCacheValid,
  serverGlobalCacheVersion,
) {
  const popularCoinsList = store.getState().coins.displayedPopularCoinsList;

  // Handle the case where no popularCoinsList data is available
  if (!Array.isArray(popularCoinsList) || popularCoinsList.length === 0) {
    console.log(
      "We didn't start with PopularCoinsLists data so we need to fetch it.",
    );
    await fetchUpdateAndReinitalizePopularCoinsListCache({
      store,
      indexedDBCacheIsValid: isCacheValid,
    });
    store.dispatch(appInfoActions.finishPopularCoinsListPreloading());
  } else {
    console.log(
      "We started with PopularCoinsLists data from the server. DON'T FETCH IT AGAIN, just initialize the cache with it.",
    );
    await store.dispatch(
      initializePopularCoinsListCache({
        indexedDBCacheIsValid: isCacheValid,
      }),
    );
    store.dispatch(appInfoActions.finishPopularCoinsListPreloading());
    updateGlobalCacheVersionIfNecessary(serverGlobalCacheVersion);
  }
}

/**
 * Fetches data for multiple currencies from IndexedDB cache.
 *
 * @param {string} tableName - The name of the table in IndexedDB.
 * @param {string[]} currencyKeys - An array of currency keys to fetch data for.
 * @returns {Promise<{ [key: string]: any }>} - Returns a promise that resolves to an object
 *   where each key is a currency key and the corresponding value is the fetched data, or `null` if not found.
 */
export async function fetchCurrencyDataFromIndexedDB(
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
}

/**
 * Loads cached coin details for a given currency into Redux if available.
 *
 * @param {string} currency - The currency for which the cache needs to be loaded.
 * @param {function} dispatch - The dispatch method from the store.
 * @returns {Promise<void>} Returns a promise indicating success or failure.
 */
export async function loadCachedCoinDetailsToRedux(currency, dispatch) {
  console.log("loadCachedCoinDetailsToRedux");
  try {
    const fetchedData = await fetchDataFromIndexedDB(
      COINDETAILS_TABLENAME,
      currency,
    );

    // Check if data exists and has coinData
    if (fetchedData && fetchedData.coinData) {
      console.log(`Preloaded Coin Data exists for ${currency}: ${fetchedData}`);
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
 * Clears cache for all keys in a specific table.
 * @param {string} tableName - The name of the table in the IndexedDB.
 */
export async function clearCacheForAllKeysInTable(tableName) {
  try {
    await db[tableName].clear(); // Clear all keys in the table
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
 * @param {string} tableName - The name of the table in the IndexedDB.
 * @param {string} currency - The currency for which coin data is to be deleted.
 * @param {string} coinId - The ID of the coin to be deleted.
 * @returns {Promise<void>} - Returns a promise that resolves when the coin data is deleted.
 */
export async function deleteCoinDataForCurrencyByIdFromBrowser(
  tableName,
  currency,
  coinId,
) {
  try {
    const coinDataForCurrency = await db[tableName].get(currency);
    if (
      coinDataForCurrency &&
      coinDataForCurrency.coinData &&
      coinDataForCurrency.coinData[coinId]
    ) {
      delete coinDataForCurrency.coinData[coinId];
      await db[tableName].put(coinDataForCurrency, currency);
    }
  } catch (err) {
    console.error(
      `Error deleting coin data from IndexedDB for currency ${currency} and coin ID ${coinId}:`,
      err,
    );
  }
}

/**
 * Removes data for a given coin from the COINDETAILS table in the IndexedDB for all currencies.
 *
 * @param {string} coinId - The ID of the coin to remove.
 * @returns {Promise<void>} Returns a promise indicating success or failure of the removal operation.
 */
export async function removeCoinDetailsFromIndexedDBForAllCurrencies(coinId) {
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
}

/**
 * Clears cache from indexedDB, and cookie.
 */
export async function clearAllCaches() {
  console.warn("CLEARING ALL CACHES");
  await clearCacheForAllKeysInTable(POPULARCOINSLISTS_TABLENAME);
  await clearCacheForAllKeysInTable(COINDETAILS_TABLENAME);
  await clearCacheForAllKeysInTable(CURRENCYRATES_TABLENAME);
  localStorage?.removeItem("preloadedCoins");
  console.log("Cache cleared for preloadedCoins");
  console.warn("ALL CACHES CLEARED");
}
