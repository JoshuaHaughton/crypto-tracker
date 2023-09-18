import { createAsyncThunk } from "@reduxjs/toolkit";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import { SYMBOLS_BY_CURRENCIES } from "../global/constants";

/**
 * Thunk to update currency.
 * Uses a web worker to perform the currency transformation for a list of coins.
 * After receiving the transformed data from the web worker, dispatches the results to the Redux store.
 */
export const updateCurrency = createAsyncThunk(
  "currency/update",
  async (payload, { dispatch, getState }) => {
    console.log("updateCurrencyThunk active", payload);

    const { currency: updatedCurrency } = payload;
    const state = getState();

    const {
      coins: { displayedCoinListCoins: initialHundredCoins },
      currency: { initialCurrency, currencyRates: initialRates },
    } = state;

    // // Initialize the web worker
    // const currencyTransformerWorker = new Worker(
    //   "/webWorkers/currencyTransformerWorker.js",
    // );

    // // Listen for messages from the web worker
    // currencyTransformerWorker.onmessage = ({ data, type }) => {
    //   const { transformedData } = data;
    //   const trendingCoins = transformedData.slice(0, 10);

    //   // Dispatch the transformed data
    //   dispatch(
    //     coinsActions.updateCoins({
    //       displayedCoinListCoins: transformedData,
    //       trendingCarouselCoins: trendingCoins,
    //       symbol: SYMBOLS_BY_CURRENCIES[updatedCurrency],
    //     }),
    //   );
    // };

    // Send data to the web worker for transformation
    currencyTransformerWorker.postMessage({
      type: "transformCoinList",
      data: {
        coinsToTransform: initialHundredCoins,
        fromCurrency: initialCurrency.toUpperCase(),
        toCurrency: updatedCurrency.toUpperCase(),
        currencyRates: initialRates,
      },
    });

    // Update the currency state
    dispatch(currencyActions.changeCurrency(payload));
  },
);
