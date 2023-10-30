import { createAsyncThunk } from "@reduxjs/toolkit";
import { appInfoActions } from "../store/appInfo";
import {
  deleteCoinDetailsByIdForCurrencyFromIndexedDb,
  preloadCoinDetails,
} from "../utils/cache.utils";
import { fetchCoinDetailsData } from "../utils/api.utils";
import { MAXIMUM_PRELOADED_COIN_COUNT } from "../global/constants";

/**
 * Fetches coin details and preloads them using Redux Thunk.
 * The action ensures that the coin isn't already being fetched, checks the cache,
 * fetches and preloads the coin details.
 *
 * @param {Object} payload - The payload containing necessary details.
 * @returns {Promise<void>}
 */
export const fetchAndPreloadCoinDetailsThunk = createAsyncThunk(
  "coins/fetchAndPreloadCoin",
  async (payload, { dispatch, getState }) => {
    const { coinId } = payload;

    const state = getState();
    const { coinsBeingFetched } = state.appInfo;
    const { currentCurrency, currencyRates } = state.currency;

    console.warn(
      "coinsBeingFetched - fetchAndPreloadCoinDetailsThunk",
      coinsBeingFetched,
    );

    // Check if the coin is currently being fetched.
    if (coinsBeingFetched[coinId]) {
      console.error(`Coin ${coinId} is currently being fetched.`);
      return;
    }

    // Get the current preloaded coin IDs from the cache.
    let currentPreloadedCoinIds = JSON.parse(
      localStorage?.getItem("preloadedCoins") || "[]",
    );

    // Check if fetching this coin would exceed the maximum preloaded coin count.
    if (
      currentPreloadedCoinIds.length + Object.keys(coinsBeingFetched).length >=
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
      dispatch(appInfoActions.addCoinBeingFetched({ coinId }));

      // Fetch the detailed data for the coin.
      const detailedData = await fetchCoinDetailsData(coinId, currentCurrency);
      if (detailedData == null) return;

      // Extract the initial rates from the detailed data.
      const {
        currencyRates: removedCurrencyRates,
        ...dataWithoutCurrencyRates
      } = detailedData;

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
  },
);
