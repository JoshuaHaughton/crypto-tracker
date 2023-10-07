import { useEffect } from "react";
import {
  fetchUpdateAndReinitalizeCoinListCache,
  validateAndClearCache,
} from "../utils/cache.utils";
import { initializeCoinListCache } from "../thunks/coinListCacheThunk";

/**
 * Handles the initialization of CoinLists data based on the cache validity and initial data available.
 *
 * If the cache is not valid and no initial data is available, it fetches and initializes the CoinList data.
 * Otherwise, if there's initial data, it initializes the cache with that data without fetching/preloading.
 *
 * @param {Object} store - The Redux store.
 * @param {boolean} isCacheValid - Indicates whether the cache is valid or not.
 * @returns {Promise<void>}
 */
const handleCoinListInitialization = async (store, isCacheValid) => {
  const initialHundredCoins = store.getState().coins.displayedCoinListCoins;

  if (!Array.isArray(initialHundredCoins) || initialHundredCoins.length === 0) {
    console.log(
      "We didn't start with CoinLists data so we need to preload it.",
    );
    fetchUpdateAndReinitalizeCoinListCache(store, isCacheValid);
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
    const initializeData = async () => {
      const isCacheValid = await validateAndClearCache(
        serverGlobalCacheVersion,
      );
      await handleCoinListInitialization(store, isCacheValid);
    };

    initializeData();
  }, [store, serverGlobalCacheVersion]);
};
