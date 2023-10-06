import { useEffect } from "react";
import { fetchUpdateAndReinitalizeCoinListCache } from "../utils/cache.utils";
import { initializeCoinListCache } from "../thunks/coinListCacheThunk";

/**
 * Custom hook to handle data initialization.
 *
 * @param {Object} store - The Redux store.
 * @param {string} globalCacheVersion - The global cache version.
 */
export const useDataInitialization = (store, globalCacheVersion) => {
  useEffect(() => {
    // Get the initial list of coins from the store
    const initialHundredCoins = store.getState().coins.displayedCoinListCoins;

    // Preload CoinLists data if necessary
    if (
      !Array.isArray(initialHundredCoins) ||
      initialHundredCoins.length === 0
    ) {
      // We didnt start with CoinLists data so we need to preload it.
      console.log(
        "We didnt start with CoinLists data so we need to preload it.",
      );

      fetchUpdateAndReinitalizeCoinListCache(store);
    } else {
      // We start with CoinLists data so we don't need to fetch it again
      console.log(
        "We start with CoinLists data. DON'T FETCH/PRELOAD IT, just initalize the cache with it.",
      );

      store.dispatch(initializeCoinListCache());
    }
  }, [store, globalCacheVersion]);
};
