import { createAsyncThunk } from "@reduxjs/toolkit";
import { TRootState } from "@/lib/store";
import { fetchAndInitializeCoinsCache } from "@/utils/cache.utils";
import { fetchAndPreloadCoinDetailsThunk } from "./fetchAndPreloadCoinDetailsThunk";
import { initializePopularCoinsAndDetailsCache } from "./initializeCoinCacheThunk";

/**
 * Redux thunk action for hydrating coin-related data based on the current route.
 * It checks if the user is on a coin details page and fetches necessary data accordingly.
 * It also ensures that the popular coins list is loaded and initializes the cache if needed.
 *
 * @param symbol - The coin symbol from the current route. Null if not on a coin details page.
 * @returns Asynchronous thunk action.
 */
export const hydrateCoinDataBasedOnRoute = createAsyncThunk<
  void,
  string | null,
  { state: TRootState }
>(
  "coins/hydrateCoinDataBasedOnRoute",
  async (symbol, { dispatch, getState }) => {
    console.log("hydrateCoinDataBasedOnRoute - Start");

    // Extract necessary states
    const { coins, appInfo } = getState();
    const isOnCoinDetailsPage = symbol != null;
    const selectedCoinDetails = coins.selectedCoinDetails;
    const coinIsBeingPreloaded =
      isOnCoinDetailsPage && appInfo.coinsBeingPreloaded[symbol];
    const coinDetailsArePreloaded =
      selectedCoinDetails?.priceChartDataset != null;

    // Handle coin details loading for the coin details page
    if (isOnCoinDetailsPage) {
      console.log("hydrateCoinDataBasedOnRoute - On Coin Details Page");
      if (!coinDetailsArePreloaded && !coinIsBeingPreloaded) {
        console.warn(
          "Coin Details not preloaded - Initiating fetch and preload.",
        );
        
        // Dispatch thunk to fetch and preload coin details
        await dispatch(
          fetchAndPreloadCoinDetailsThunk({
            coinId: symbol,
            selectCoinAfterFetch: true,
          }),
        );
      }
    }

    // Check for the existence of the popular coins list in the state
    const popularCoinsList = coins.popularCoins;
    const popularCoinsAlreadyExist =
      Array.isArray(popularCoinsList) && popularCoinsList.length > 0;

    // Fetch or initialize the popular coins list based on its existence in the state
    if (!popularCoinsAlreadyExist) {
      console.log("Popular Coins List not found - Fetching from cache or API.");
      // Dispatch thunk to fetch and initialize coins cache
      await dispatch(fetchAndInitializeCoinsCache());
    } else {
      console.log("Popular Coins List found - Initializing cache.");
      // Dispatch action to initialize cache with existing popular coins list
      dispatch(initializePopularCoinsAndDetailsCache());
    }

    console.log("hydrateCoinDataBasedOnRoute - End");
  },
);
