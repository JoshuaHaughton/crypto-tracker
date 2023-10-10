import { createAsyncThunk } from "@reduxjs/toolkit";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import { postMessageToCurrencyTransformerWorker } from "../utils/currencyTransformerService";
import Cookies from "js-cookie";
import { CURRENT_CURRENCY_COOKIE_EXPIRY_TIME } from "../global/constants";
import { isEmpty } from "lodash";

/**
 * Thunk to update currency.
 * @param {Object} payload - The payload containing the currency data.
 * @param {string} payload.currency - The updated currency value.
 * @returns {Promise<void>} - Resolves after all actions are dispatched.
 *
 * Uses a web worker to perform the currency transformation for a list of coins.
 * After receiving the transformed data from the web worker, dispatches the results to the Redux store.
 */
export const updateCurrency = createAsyncThunk(
  "currency/update",
  async (payload, { dispatch, getState }) => {
    console.log("updateCurrencyThunk active", payload);

    const { currency: updatedCurrency } = payload;
    const {
      coins: {
        displayedCoinListCoins,
        coinListCoinsByCurrency,
        selectedCoinDetails,
        cachedCoinDetailsByCurrency,
      },
      currency: { currentCurrency, currencyRates: initialRates },
    } = getState();

    // Update cookie immediately
    Cookies.set("currentCurrency", updatedCurrency, {
      expires: CURRENT_CURRENCY_COOKIE_EXPIRY_TIME,
    });

    const updateCurrencyAndCache = (type, coins, cache) => {
      if (cache && !isEmpty(cache)) {
        console.log(`CACHE USED - COIN ${type.toUpperCase()}`);
        dispatch(
          type === "Details"
            ? coinsActions.updateSelectedCoin({ coinDetails: cache })
            : coinsActions.updateCoins({
                displayedCoinListCoins: cache,
                trendingCarouselCoins: cache.slice(0, 10),
              }),
        );
        // Update the currency state after all coins have been updated
        dispatch(currencyActions.changeCurrency(payload));
      } else {
        // We update the currency after the transformations when not using the cache iside of the transformerworker so that we call it as soon as it's ready
        console.log(`CACHE NOT USED - COIN ${type.toUpperCase()}`);
        console.log(`CACHE NOT USED - COIN`, coins);
        // Only transform the requested currency first to save time. Then, we cache the rest
        postMessageToCurrencyTransformerWorker({
          type: `transformCoin${type}Currency`,
          data: {
            [type === "Details" ? "coinToTransform" : "coinsToTransform"]:
              coins,
            fromCurrency: currentCurrency.toUpperCase(),
            toCurrency: updatedCurrency.toUpperCase(),
            currencyRates: initialRates,
          },
        });
        // Re-attempt caching all coins - if one doesn't exist, then there's a good chance that there's more than one
        postMessageToCurrencyTransformerWorker({
          type: `transformAllCoin${type}Currencies`,
          data: {
            [type === "Details" ? "coinToTransform" : "coinsToTransform"]:
              coins,
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
    };

    // Handle selected coin details transformations if needed.
    if (Object.keys(selectedCoinDetails).length > 0) {
      const cache =
        cachedCoinDetailsByCurrency[updatedCurrency]?.[
          selectedCoinDetails.coinInfo.symbol.toUpperCase()
        ];
      console.log("cache", cachedCoinDetailsByCurrency);
      console.log("cache", cache);
      updateCurrencyAndCache("Details", selectedCoinDetails, cache);
    }

    // Handle coin list transformations
    updateCurrencyAndCache(
      "List",
      displayedCoinListCoins,
      coinListCoinsByCurrency[updatedCurrency],
    );
  },
);
