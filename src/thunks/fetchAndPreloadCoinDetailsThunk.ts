import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteCoinDetailsByIdForCurrencyFromIndexedDb,
  preloadCoinDetails,
} from "../utils/cache.utils";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { fetchCoinDetailsData } from "@/utils/api.server.utils";
import { MAXIMUM_PRELOADED_COIN_COUNT } from "@/lib/constants/globalConstants";

// Define the type for the thunk's argument
interface FetchCoinDetailsPayload {
  coinId: string;
  selectCoinAfterFetch?: boolean;
}

/**
 * Fetches coin details and preloads them using Redux Thunk.
 * The action ensures that the coin isn't already being fetched, checks the cache,
 * fetches and preloads the coin details.
 *
 * @param {FetchCoinDetailsPayload} payload - The payload containing necessary details.
 * @returns {Promise<void>}
 */
export const fetchAndPreloadCoinDetailsThunk = createAsyncThunk(
  "coins/fetchAndPreloadCoin",
  async (payload: FetchCoinDetailsPayload, { dispatch, getState }) => {
    const { coinId, selectCoinAfterFetch } = payload;
    console.error("PAYLOAD", payload);

    const state = getState();
    const { coinsBeingPreloaded } = state.appInfo;
    const { currentCurrency, currencyRates } = state.currency;

    console.warn(
      "coinsBeingPreloaded - fetchAndPreloadCoinDetailsThunk",
      coinsBeingPreloaded,
    );

    // Check if the coin is currently being fetched.
    if (coinsBeingPreloaded[coinId]) {
      console.error(`Coin ${coinId} is currently being fetched.`);
      return;
    }

    // Get the current preloaded coin IDs from the cache.
    let currentPreloadedCoinIds = JSON.parse(
      localStorage?.getItem("preloadedCoins") || "[]",
    );

    // Check if fetching this coin would exceed the maximum preloaded coin count.
    if (
      currentPreloadedCoinIds.length +
        Object.keys(coinsBeingPreloaded).length >=
      MAXIMUM_PRELOADED_COIN_COUNT
    ) {
      // Remove the earliest added coin from the list.
      const coinToRemove = currentPreloadedCoinIds.shift();

      // Remove that coin's data from IndexedDB.
      await deleteCoinDetailsByIdForCurrencyFromIndexedDb(
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

    try {
      // Mark the coin as being fetched to prevent duplicate fetches.
      dispatch(appInfoActions.addCoinBeingPreloaded({ coinId }));

      // Fetch the detailed data for the coin.
      const detailedData = await fetchCoinDetailsData(coinId, currentCurrency);
      if (detailedData == null) return;

      // Extract the initial rates from the detailed data.
      const { coinDetails } = detailedData;

      if (selectCoinAfterFetch) {
        dispatch(
          coinsActions.setSelectedCoinDetails({
            coinDetails,
          }),
        );
      }

      // Preload the coin details.
      await preloadCoinDetails(
        dispatch,
        coinDetails,
        currentCurrency,
        currencyRates,
      );
    } catch (error) {
      console.error("Error preloading coin data:", error);
    } finally {
      // Mark the coin as no longer being fetched.
      dispatch(appInfoActions.removeCoinBeingPreloaded({ coinId }));
    }
  },
);
