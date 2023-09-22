import { createAsyncThunk } from "@reduxjs/toolkit";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import { postMessageToCurrencyTransformerWorker } from "../utils/currencyTransformerService";

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
      currency: { currentCurrency, currencyRates: initialRates },
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

      // Update the currency state after all coins have been updated
      dispatch(currencyActions.changeCurrency(payload));
    } else {
      // CoinList Cache doesn't exist
      console.log("CACHE NOT USED");
      // Only transform the requested currency first to save time. Then, we cache the rest
      postMessageToCurrencyTransformerWorker({
        type: "transformCoinListCurrency",
        data: {
          coinsToTransform: displayedCoinListCoins,
          fromCurrency: currentCurrency.toUpperCase(),
          toCurrency: updatedCurrency.toUpperCase(),
          currencyRates: initialRates,
        },
      });
      // Re-attempt caching all coins - if one doesn't exist, then there's a good chance that there's more than one
      postMessageToCurrencyTransformerWorker({
        type: "transformAllCoinListCurrencies",
        data: {
          coinsToTransform: displayedCoinListCoins,
          fromCurrency: currentCurrency.toUpperCase(),
          currencyRates: initialRates,
          // Only transform the ones that haven't been transformed yet
          currenciesToExclude: [
            updatedCurrency.toUpperCase(),
            currentCurrency.toUpperCase(),
          ],
        },
      });
    }
  },
);
