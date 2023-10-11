import { useEffect } from "react";
import {
  fetchUpdateAndReinitalizeCoinListCache,
  loadAllCachedCoinDetailsToRedux,
  optimallyUpdateGlobalCacheVersion,
  preloadCoinDetails,
  updateGlobalCacheVersion,
  validateAndClearCache,
} from "../utils/cache.utils";
import { initializeCoinListCache } from "../thunks/coinListCacheThunk";

/**
 * Preloads the selected coin details if they are present.
 *
 * This function checks if the selected coin details are present and then preloads them.
 * It also updates the cache and adds the coin to the preloaded coin list.
 *
 * @param {Object} store - The Redux store.
 * @returns {Promise<void>}
 */
export const preloadSelectedCoinDetails = async (store) => {
  const selectedCoinDetails = store.getState().coins.selectedCoinDetails;
  const currentCurrency = store.getState().currency.currentCurrency;
  const currencyRates = store.getState().currency.currencyRates;
  if (
    Object.keys(selectedCoinDetails).length > 0 &&
    selectedCoinDetails.coinInfo
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
    console.log("We did not start with CoinDetals data from server.");
  }
};

/**
 * Initializes the CoinList data based on available cache.
 *
 * If no initial data for the coin list is available, it fetches and initializes the CoinList data.
 * Otherwise, if there's initial data, it initializes the cache with that data without fetching/preloading.
 *
 * @param {Object} store - The Redux store.
 * @param {boolean} isCacheValid - Indicates whether the cache is valid or not.
 * @returns {Promise<void>}
 */
const handleCoinListInitialization = async (store, isCacheValid) => {
  const initialHundredCoins = store.getState().coins.displayedCoinListCoins;

  // Handle the case where no initial coin list data is available
  if (!Array.isArray(initialHundredCoins) || initialHundredCoins.length === 0) {
    console.log("We didn't start with CoinLists data so we need to fetch it.");
    fetchUpdateAndReinitalizeCoinListCache(store, isCacheValid);
  } else {
    console.log(
      "We started with CoinLists data from the server. DON'T FETCH IT AGAIN, just initialize the cache with it.",
    );
    optimallyUpdateGlobalCacheVersion();
    // If we start with CoinLists data from the server, then the globalCacheVersion was updated from there
    store.dispatch(
      initializeCoinListCache({ indexedDBCacheIsValid: isCacheValid }),
    );
  }
};

/**
 * Custom hook to handle data initialization.
 *
 * @param {Object} store - The Redux store.
 * @param {string} serverGlobalCacheVersion - The global cache version from the server (optional, and should not be provided by the client cookie).
 */
export const useDataInitialization = (store, serverGlobalCacheVersion) => {
  useEffect(() => {
    console.log("useDataInitialization");
    const initializeData = async () => {
      const areNecessaryCachesValid = await validateAndClearCache(
        serverGlobalCacheVersion,
      );
      handleCoinListInitialization(store, areNecessaryCachesValid);
      await loadAllCachedCoinDetailsToRedux(store.dispatch);
      preloadSelectedCoinDetails(store);
    };

    initializeData();
  }, []);
};
