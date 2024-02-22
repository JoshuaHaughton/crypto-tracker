import { createAsyncThunk } from "@reduxjs/toolkit";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { transformAndDispatchPopularCoinsToShallow } from "../lib/utils/dataFormat.utils";
import {
  CTWAllPopularCoinsListsExternalResponseData,
  CTWMessageRequestType,
} from "../../public/webWorkers/currencyTransformer/types";
import { TRootState } from "@/lib/store";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import apiSlice from "@/lib/store/api/apiSlice";

/**
 * Asynchronously initiates the caching process for popular coins and their shallow details. This thunk first checks
 * the validity and presence of popular coins data in the cache. If data fetching is required (indicated by the handleFetch flag),
 * it fetches data from the API. The fetched or cached data is then dispatched to update the application state.
 * This process ensures that the application has up-to-date and readily available popular coins data.
 *
 * @param handleFetch - A boolean flag indicating whether to fetch data from the API (true) or use cached data (false).
 * @returns A thunk action that can be dispatched to initiate the caching process.
 */
export const initializeCoinCache = createAsyncThunk<
  void,
  { handleFetch?: boolean } | undefined,
  { state: TRootState }
>(
  "coins/initializeCoinCache",
  async ({ handleFetch = false } = {}, { dispatch, getState }) => {
    try {
      const state = getState();
      let popularCoins = state.coins.popularCoins;
      const { currentCurrency, currencyRates } = state.currency;

      // Begin preloading process for initial popular coins
      dispatch(appInfoActions.startInitialPopularCoinsLoading());
      dispatch(appInfoActions.startPopularCoinsPreloading());

      // Conditionally fetch popular coins data from the API if handleFetch is true
      if (handleFetch) {
        console.log("Fetching popular coins data from API.");
        const response = await dispatch(
          apiSlice.endpoints.fetchPopularCoinsData.initiate(currentCurrency),
        ).unwrap();
        popularCoins = response.popularCoins;
      }

      // Update the Redux store with the initial popular coins data
      dispatch(
        coinsActions.setCachedPopularCoinsMap({
          currency: currentCurrency,
          coinList: popularCoins,
        }),
      );

      // Mark the completion of initial popular coins loading
      dispatch(appInfoActions.completeInitialPopularCoinsLoading());

      // Calls `transformAndDispatchPopularCoinsToShallow` with the transformed data from the web worker and the Redux dispatch function.
      // This function processes each currency's popular coins data into a shallow format and updates the Redux store accordingly
      transformAndDispatchPopularCoinsToShallow(
        dispatch,
        popularCoins,
        currentCurrency,
      );

      // Sending current Popular Coins data to the web worker for currency transformation
      postMessageToCurrencyTransformerWorker<CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES>(
        {
          requestType: CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES,
          requestData: {
            coinsToTransform: popularCoins,
            fromCurrency: currentCurrency,
            currencyExchangeRates: currencyRates!,
            // We start off with the initial coins for the current currency, so we can exclude it to avoid
            // an unnecessary computation
            currenciesToExclude: [currentCurrency],
          },
          onComplete: (
            response: CTWAllPopularCoinsListsExternalResponseData,
          ) => {
            // Handle the transformed coins for each currency in the same way we do to the initial coins above this webworker call
            const { transformedData } = response;
            transformAndDispatchPopularCoinsToShallow(
              dispatch,
              transformedData,
            );
            // End the comprehensive preloading process
            dispatch(appInfoActions.completePopularCoinsPreloading());
          },
        },
      );
    } catch (error) {
      console.error("Failed to initialize coin cache:", error);
      // Dispatch failure actions
      dispatch(appInfoActions.failInitialPopularCoinsLoading());
      dispatch(appInfoActions.failPopularCoinsPreloading());
    }
  },
);
