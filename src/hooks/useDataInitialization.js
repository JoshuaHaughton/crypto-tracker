import { useEffect } from "react";
import Cookie from "js-cookie";
import {
  fetchUpdateAndReinitalizeCoinListCache,
  loadAllCachedCoinDetailsToRedux,
  preloadCoinDetails,
  validateAndClearCache,
} from "../utils/cache.utils";
import { initializeCoinListCache } from "../thunks/coinListCacheThunk";
/**
 * Initializes coin data and handles selected coin preloading if necessary.
 *
 * - If no initial data for the coin list is available, it fetches and initializes the CoinList data.
 * - Checks if selected coin details are available. If so, it preloads them, updates the cache,
 *   and adds the coin to the preloaded coin list.
 *
 * @param {Object} store - The Redux store.
 * @param {boolean} isCacheValid - Indicates whether the cache is valid or not.
 * @returns {Promise<void>}
 */
const initializeCoinDataAndHandlePreloads = async (store, isCacheValid) => {
  const initialHundredCoins = store.getState().coins.displayedCoinListCoins;
  const selectedCoinDetails = store.getState().coins.selectedCoinDetails;
  const currentCurrency = store.getState().currency.currentCurrency;
  const currencyRates = store.getState().currency.currencyRates;

  // Handle the case where no initial coin list data is available
  if (!Array.isArray(initialHundredCoins) || initialHundredCoins.length === 0) {
    console.log(
      "We didn't start with CoinLists data so we need to preload it.",
    );
    fetchUpdateAndReinitalizeCoinListCache(store, isCacheValid);

    // Check for the presence of selected coin details and preload if necessary
    if (
      Object.keys(selectedCoinDetails).length > 0 &&
      selectedCoinDetails.coinInfo
    ) {
      console.log(
        "We started with CoinDetails data, meaining it's new data from the server. Let's preload that.",
      );
      await preloadCoinDetails(
        store.dispatch,
        selectedCoinDetails,
        currentCurrency,
        currencyRates,
      );
    }
  } else {
    console.log(
      "We started with CoinLists data from the server. DON'T FETCH/PRELOAD IT, just initialize the cache with it.",
    );
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
      initializeCoinDataAndHandlePreloads(store, areNecessaryCachesValid);
      loadAllCachedCoinDetailsToRedux(store.dispatch);
    };

    initializeData();
  }, []);
};
