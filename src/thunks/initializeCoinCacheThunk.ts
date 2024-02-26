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

// Define two separate types for the distinct scenarios.
type TFetchPopularCoins = {
  handleFetch: true;
  popularCoins?: never;
};

type TProvidePopularCoins = {
  handleFetch: false;
  popularCoins: ICoinOverview[];
};

// Combine these types into a single type that accepts either scenario.
type TInitializeCoinCacheParams = TFetchPopularCoins | TProvidePopularCoins;

/**
 * Asynchronously initiates the caching process for popular coins.
 * Checks the provided parameters to determine whether to fetch from the API or use provided data.
 * Updates application state with the latest popular coins information.
 *
 * @param params - Parameters for caching process: either fetch flag or pre-fetched data.
 * @returns A thunk action that can be dispatched.
 */
export const initializeCoinCache = createAsyncThunk<
  void,
  TInitializeCoinCacheParams,
  { state: TRootState }
>("coins/initializeCoinCache", async (params, { dispatch, getState }) => {
  try {
    const { handleFetch, popularCoins } = params;
    const state = getState();
    const { currentCurrency, currencyRates } = state.currency;

    // Begin preloading process for initial popular coins
    dispatch(appInfoActions.startInitialPopularCoinsLoading());
    dispatch(appInfoActions.startPopularCoinsPreloading());

    let popularCoinsToUse: ICoinOverview[];

    if (handleFetch) {
      // Conditionally fetch popular coins data from the API if handleFetch is true
      console.log("Fetching popular coins data from API.");
      const response = await dispatch(
        apiSlice.endpoints.fetchPopularCoinsData.initiate(currentCurrency),
      ).unwrap();
      popularCoinsToUse = response.popularCoins;
    } else if (popularCoins) {
      // If popularCoins are provided, use these and ensure handleFetch is false.
      console.log("Using provided popular coins data.");
      popularCoinsToUse = popularCoins;
    } else {
      throw new Error(
        "Invalid parameters: must either fetch data or provide popular coins.",
      );
    }

    // Update the Redux store with the initial popular coins data
    dispatch(
      coinsActions.setCachedPopularCoinsMap({
        currency: currentCurrency,
        coinList: popularCoinsToUse,
      }),
    );

    // Mark the completion of initial popular coins loading
    dispatch(appInfoActions.completeInitialPopularCoinsLoading());

    // Calls `transformAndDispatchPopularCoinsToShallow` with the transformed data from the web worker and the Redux dispatch function.
    // This function processes each currency's popular coins data into a shallow format and updates the Redux store accordingly
    transformAndDispatchPopularCoinsToShallow(
      dispatch,
      popularCoinsToUse,
      currentCurrency,
    );

    // Sending current Popular Coins data to the web worker for currency transformation
    postMessageToCurrencyTransformerWorker<CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES>(
      {
        requestType: CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES,
        requestData: {
          coinsToTransform: popularCoinsToUse,
          fromCurrency: currentCurrency,
          currencyExchangeRates: currencyRates!,
          // We start off with the initial coins for the current currency, so we can exclude it to avoid
          // an unnecessary computation
          currenciesToExclude: [currentCurrency],
        },
        onComplete: (response: CTWAllPopularCoinsListsExternalResponseData) => {
          // Handle the transformed coins for each currency in the same way we do to the initial coins above this webworker call
          const { transformedData } = response;
          transformAndDispatchPopularCoinsToShallow(dispatch, transformedData);
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
});
