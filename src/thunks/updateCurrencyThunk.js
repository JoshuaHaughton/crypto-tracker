import { createAsyncThunk } from "@reduxjs/toolkit";
import { currencyActions } from "../store/currency";
import { postMessageToCurrencyTransformerWorker } from "../utils/currencyTransformerService";

/**
 * Thunk to update currency.
 * Uses a web worker to perform the currency transformation for a list of coins.
 * After receiving the transformed data from the web worker, dispatches the results to the Redux store.
 */
export const updateCurrency = createAsyncThunk(
  "currency/update",
  async (payload, { getState }) => {
    console.log("updateCurrencyThunk called", payload);

    const { currency: updatedCurrency } = payload;
    const state = getState();

    const {
      coins: { displayedCoinListCoins, selectedCoinDetails },
      currency: { currentCurrency, currencyRates },
    } = state;

    if (selectedCoinDetails != null) {
      postMessageToCurrencyTransformerWorker({
        type: "transformCoinDetailsCurrency",
        data: {
          coinToTransform: selectedCoinDetails,
          fromCurrency: currentCurrency.toUpperCase(),
          toCurrency: updatedCurrency.toUpperCase(),
          currencyRates,
        },
      });
    }
    // Send data to the web worker for transformation
    postMessageToCurrencyTransformerWorker({
      type: "transformCoinListCurrency",
      data: {
        coinsToTransform: displayedCoinListCoins,
        fromCurrency: currentCurrency.toUpperCase(),
        toCurrency: updatedCurrency.toUpperCase(),
        currencyRates,
      },
    });
    console.log("post to web worker");
  },
);
