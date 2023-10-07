import { useEffect } from "react";
import {
  fetchUpdateAndReinitalizeCoinListCache,
  validateAndClearCache,
} from "../utils/cache.utils";
import { initializeCoinListCache } from "../thunks/coinListCacheThunk";

/**
 * Handles the initialization of CoinLists data.
 *
 * @param {Object} store - The Redux store.
 * @returns {Promise<void>}
 */
const handleCoinListInitialization = async (store) => {
  const initialHundredCoins = store.getState().coins.displayedCoinListCoins;

  if (!Array.isArray(initialHundredCoins) || initialHundredCoins.length === 0) {
    console.log(
      "We didn't start with CoinLists data so we need to preload it.",
    );
    fetchUpdateAndReinitalizeCoinListCache(store);
  } else {
    console.log(
      "We start with CoinLists data. DON'T FETCH/PRELOAD IT, just initialize the cache with it.",
    );
    store.dispatch(initializeCoinListCache());
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
      await validateAndClearCache(serverGlobalCacheVersion);
      await handleCoinListInitialization(store);
    };

    initializeData();
  }, [store, serverGlobalCacheVersion]);
};
