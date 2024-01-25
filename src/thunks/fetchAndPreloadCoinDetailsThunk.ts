import { createAsyncThunk } from "@reduxjs/toolkit";
import { preloadFetchedCoinDetails } from "../utils/cache.utils";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { fetchCoinDetailsData } from "@/utils/api.server.utils";
import { TRootState } from "@/lib/store";

// Define the type for the thunk's argument
interface FetchCoinDetailsPayload {
  coinId: string;
  selectCoinAfterFetch?: boolean;
}

/**
 * Asynchronous thunk action to fetch coin details and preload them into the Redux store.
 * It handles the complete lifecycle of the fetch request, including the dispatch of pending,
 * fulfilled, and rejected actions. This thunk ensures the coin isn't already being fetched,
 * checks the cache, and then fetches and preloads the coin details.
 *
 * @param payload - The payload containing necessary details for fetching coin details.
 * @returns A promise that represents the state of the operation.
 */
export const fetchAndPreloadCoinDetailsThunk = createAsyncThunk<
  void,
  FetchCoinDetailsPayload,
  { state: TRootState }
>(
  "coins/fetchAndPreloadCoin",
  async (
    payload: FetchCoinDetailsPayload,
    { dispatch, getState },
  ): Promise<void> => {
    const state = getState();
    const { coinId, selectCoinAfterFetch } = payload;
    const { coinsBeingPreloaded } = state.appInfo;
    const { currentCurrency, currencyRates } = state.currency;
    const { preloadedCoinDetailsByCurrency } = state.coins;
    const coinIsBeingFetched = coinsBeingPreloaded[coinId] != null;
    const coinIsAlreadyPreloaded =
      preloadedCoinDetailsByCurrency[currentCurrency][coinId] != null;

    console.error("PAYLOAD", payload);
    console.warn(
      "coinsBeingPreloaded - fetchAndPreloadCoinDetailsThunk",
      coinsBeingPreloaded,
    );

    // Check if the coin is already being fetched.
    if (coinIsBeingFetched) {
      console.error(`Coin ${coinId} is already being fetched.`);
      return;
    }

    // Check if the coin has already been preloaded.
    if (coinIsAlreadyPreloaded) {
      console.error(`Coin ${coinId} has already been preloaded.`);
      return;
    }

    try {
      // Mark the coin as being fetched to prevent duplicate fetches.
      dispatch(appInfoActions.addCoinBeingPreloaded({ coinId }));

      // Fetch the detailed data for the coin from the CryptoCompre API.
      const detailedDataResponse = await fetchCoinDetailsData(
        coinId,
        currentCurrency,
      );
      if (detailedDataResponse == null) return;

      const { coinDetails, currencyExchangeRates } = detailedDataResponse;

      // Select this coin if we are going to the page for it
      if (selectCoinAfterFetch) {
        dispatch(
          coinsActions.setSelectedCoinDetails({
            coinDetails,
          }),
        );
      }

      // Save the coin details to the preloadedCoins redux cache for the current currency synchornously, as well as
      // other currencies asynchronously by using a web worker for transformations
      preloadFetchedCoinDetails({
        dispatch,
        coinDetails,
        currentCurrency,
        currencyExchangeRates,
      });
    } catch (error) {
      console.error("Error preloading coin data:", error);
    } finally {
      // Mark the coin as no longer being fetched.
      dispatch(appInfoActions.removeCoinBeingPreloaded({ coinId }));
    }
  },
);
