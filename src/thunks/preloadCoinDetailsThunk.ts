import { createAsyncThunk } from "@reduxjs/toolkit";
import { TAppDispatch, TRootState } from "@/lib/store";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { ICoinDetails } from "@/types/coinTypes";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { CTWMessageRequestType } from "../../public/webWorkers/currencyTransformer/types";

/**
 * Thunk action to preload a coin's details using CoinOverview details from the coin slice
 * and currency exchange rates from the currency slice.
 * After preloading for the current currency, asynchronously starts the preloading process
 * for all other currencies using the currency transformer web worker.
 *
 * @param params - The parameters for preloading coin details.
 * @returns A thunk action that updates the preloaded coin details.
 */
export const preloadCoinDetails = createAsyncThunk<
  void,
  ICoinDetails,
  {
    state: TRootState;
    dispatch: TAppDispatch;
  }
>(
  "coins/preloadCoinDetails",
  async (preloadedDetails, { getState, dispatch }) => {
    const state = getState();
    const { currentCurrency, currencyRates } = state.currency;

    // Check if currencyRates is null and return early if so
    if (currencyRates == null) {
      console.error("Error: currencyRates. Please reload the app");
      return;
    }

    // Immediately set the preloaded coinDetails for the current currency using the data that we have
    dispatch(
      coinsActions.setPreloadedCoinDetailsUsingPopularCoinsBase({
        coinDetails: preloadedDetails,
        currency: currentCurrency,
      }),
    );

    // Asynchronously start preloading for other currencies using the web worker to transform the existing data's currencies
    postMessageToCurrencyTransformerWorker({
      requestType: CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES,
      requestData: {
        coinToTransform: preloadedDetails,
        fromCurrency: currentCurrency,
        currencyExchangeRates: currencyRates,
      },
    });
  },
);
