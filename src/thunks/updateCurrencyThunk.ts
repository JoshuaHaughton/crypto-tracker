import { createAsyncThunk } from "@reduxjs/toolkit";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { ICoinDetails } from "@/types/coinTypes";
import { currencyActions } from "@/lib/store/currency/currencySlice";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import Cookies from "js-cookie";
import { isEmpty } from "lodash";
import { storeCurrentCurrencyInIndexedDB } from "../utils/cache.utils";
import { CURRENT_CURRENCY_COOKIE_EXPIRY_TIME } from "@/lib/constants/globalConstants";

/**
 * Thunk to update currency.
 * @param {Object} payload - The payload containing the currency data.
 * @param {string} payload.updatedCurrency - The updated currency value.
 * @returns {Promise<void>} - Resolves after all actions are dispatched.
 *
 * Uses a web worker to perform the currency transformation for a list of coins.
 * After receiving the transformed data from the web worker, dispatches the results to the Redux store.
 */
export const updateCurrency = createAsyncThunk(
  "currency/update",
  async (payload, { dispatch, getState }) => {
    console.log("updateCurrencyThunk active", payload);

    const { updatedCurrency } = payload;
    const {
      coins: {
        popularCoins,
        cachedPopularCoinsByCurrency,
        selectedCoinDetails,
        cachedSelectedCoinDetailsByCurrency,
      },
      currency: { currentCurrency, currencyRates },
    } = getState();

    // Update cookie immediately
    Cookies.set("currentCurrency", updatedCurrency, {
      expires: CURRENT_CURRENCY_COOKIE_EXPIRY_TIME,
    });

    // Save the currency to indexedDB for serviceWorker access (serviceWorker API can't currently access cookies)
    // We use the service worker to bust the Vercel cache in production
    // storeCurrentCurrencyInIndexedDB(updatedCurrency);

    const updateCurrencyAndCache = (type, coins, cache) => {
      if (cache && !isEmpty(cache)) {
        console.log(`CACHE USED - ${type.toUpperCase()}`);
        dispatch(
          type === "CoinDetails"
            ? coinsActions.setSelectedCoinDetails({ coinDetails: cache })
            : coinsActions.setPopularCoins({
                coinList: cache,
              }),
        );
        // Update the currency state after all coins have been updated
        dispatch(
          currencyActions.setDisplayedCurrency({ currency: updatedCurrency }),
        );
      } else {
        // We update the currency after the transformations when not using the cache iside of the transformerworker so that we call it as soon as it's ready
        console.log(`CACHE NOT USED - ${type.toUpperCase()}`);
        console.log(`CACHE NOT USED - DATA`, coins);
        // Only transform the requested currency first to save time. Then, we cache the rest in the background
        postMessageToCurrencyTransformerWorker({
          type: `transform${type}Currency`,
          data: {
            [type === "CoinDetails" ? "coinToTransform" : "coinsToTransform"]:
              coins,
            fromCurrency: currentCurrency.toUpperCase(),
            toCurrency: updatedCurrency.toUpperCase(),
            currencyRates,
          },
        });
        // Re-attempt caching all coins - if one doesn't exist, then there's a good chance that there's more than one
        postMessageToCurrencyTransformerWorker({
          type: `transformAll${type}Currencies`,
          data: {
            [type === "CoinDetails" ? "coinToTransform" : "coinsToTransform"]:
              coins,
            fromCurrency: currentCurrency.toUpperCase(),
            currencyRates,
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
    if (!isEmpty(selectedCoinDetails)) {
      const coinId = selectedCoinDetails.coinAttributes.id.toUpperCase();
      const fullPreloadExists =
        cachedSelectedCoinDetailsByCurrency[updatedCurrency]?.[coinId]
          ?.priceChartDataset != null;
      const cache = fullPreloadExists
        ? cachedSelectedCoinDetailsByCurrency[updatedCurrency]?.[coinId]
        : null;
      updateCurrencyAndCache("CoinDetails", selectedCoinDetails, cache);
    }

    // Handle coin list transformations
    updateCurrencyAndCache(
      "PopularCoinsList",
      popularCoins,
      cachedPopularCoinsByCurrency[updatedCurrency],
    );
  },
);
