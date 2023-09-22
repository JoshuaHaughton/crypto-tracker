import { createAsyncThunk } from "@reduxjs/toolkit";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import { SYMBOLS_BY_CURRENCIES } from "../global/constants";
import { postMessageToCurrencyTransformerWorker } from "../utils/currencyTransformerService";
import { batch } from "react-redux";

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
      coins: {
        displayedCoinListCoins,
        coinListCoinsByCurrency,
        selectedCoinDetails,
      },
      currency: { initialCurrency, currencyRates: initialRates },
    } = state;

    //handle coin details transformations if needed. We can prioritize these since if they exist,
    // we aren't on the page with coin list coins anyways
    if (selectedCoinDetails.length) {
    }

    // Coinlist Cache exists
    if (coinListCoinsByCurrency[updatedCurrency].length > 0) {
      console.log("CACHE USED");
      // Dispatch the cached data
      dispatch(
        coinsActions.updateCoins({
          displayedCoinListCoins: coinListCoinsByCurrency[updatedCurrency],
          trendingCarouselCoins: coinListCoinsByCurrency[updatedCurrency].slice(
            0,
            10,
          ),
        }),
      );
    } else {
      // CoinList Cache doesn't exist
      console.log("CACHE NOT USED");
      // Re-attempt caching all coins - if one doesn't exist, then there's a good chance that there's more than one
      postMessageToCurrencyTransformerWorker({
        type: "transformAllCoinListCurrencies",
        data: {
          coinsToTransform: displayedCoinListCoins,
          fromCurrency: initialCurrency.toUpperCase(),
          toCurrency: updatedCurrency.toUpperCase(),
          currencyRates: initialRates,
        },
      });
    }

    // Update the currency state
    dispatch(currencyActions.changeCurrency(payload));
  },
);
