import {
  isCacheValid,
  saveCoinDataForCurrencyInBrowser,
  storeCurrencyRatesInIndexedDB,
} from "../utils/cache.utils";
import { coinsActions } from "../store/coins";
import db from "../utils/database";
import { COINLISTS_TABLENAME } from "../global/constants";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postMessageToCurrencyTransformerWorker } from "../utils/currencyTransformerService";

/**
 * Async thunk to manage caching of coin list data for multiple currencies.
 *
 * The thunk checks if coin data exists in the cache (IndexedDB) and is valid.
 * - If the cache is valid, it dispatches the cached data to the Redux store.
 * - If the cache is invalid or the data does not exist, it sends the initial coin data to a web worker for currency transformation.
 *
 * Once the web worker processes the data and sends it back, the thunk:
 * - Dispatches the transformed data to the Redux store.
 * - Caches the transformed data in IndexedDB.
 *
 * @returns {Function} Thunk action.
 */
export const initializeCoinListCache = createAsyncThunk(
  "coins/initializeCoinListCache",
  async (_, { dispatch, getState }) => {
    const state = getState();
    const initialHundredCoins = state.coins.displayedCoinListCoins;
    const initialRates = state.currency.currencyRates;
    const currentCurrency = state.currency.currentCurrency;
    console.log("cacheThunk active", state);

    // If data isn't in the cache, or the cache isn't valid, send the initial data to the web worker
    // for currency transformation. After that, we save it to the cache
    if (!isCacheValid(COINLISTS_TABLENAME)) {
      console.log("INVALID CACHE - COIN LISTS");
      if (typeof window !== "undefined") {
        postMessageToCurrencyTransformerWorker({
          type: "transformAllCoinListCurrencies",
          data: {
            coinsToTransform: initialHundredCoins,
            fromCurrency: currentCurrency.toUpperCase(),
            currencyRates: initialRates,
            // We start off with the initial coins for the current currency, so we can exclude it to avoid
            // an unnecessary computation
            currenciesToExclude: [currentCurrency],
          },
        });

        // Store initial data in Redux
        dispatch(
          coinsActions.setCoinListForCurrency({
            currency: currentCurrency.toUpperCase(),
            coinData: initialHundredCoins,
          }),
        );

        // Store initial data in cache
        saveCoinDataForCurrencyInBrowser(
          COINLISTS_TABLENAME,
          currentCurrency.toUpperCase(),
          initialHundredCoins,
        );
      }
    } else {
      // Use the IndexedDB cache if it's valid
      console.log("VALID CACHE - COIN LISTS");

      await db.coinLists
        .each((data) => {
          if (
            data.currency !== currentCurrency.toUpperCase() &&
            data?.coinData
          ) {
            dispatch(
              coinsActions.setCoinListForCurrency({
                currency: data.currency,
                coinData: data.coinData,
              }),
            );
          }
        })
        .catch((err) =>
          console.error("Error fetching data from IndexedDB:", err),
        );
    }
  },
);
