import {
  saveCoinDataForCurrencyInBrowser,
  storeCurrencyRatesInIndexedDB,
  validateCacheDataForTable,
} from "../utils/cache.utils";
import { coinsActions } from "../store/coins";
import db from "../utils/database";
import { POPULARCOINSLISTS_TABLENAME } from "../global/constants";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";

/**
 * Async thunk to manage caching of PopularCoinsList data for multiple currencies.
 *
 * The thunk checks if coin data exists in the cache (IndexedDB) and is valid.
 * - If the cache is valid, it just dispatches the cached data to the Redux store.
 *
 * - If the cache is invalid or the data does not exist,
 *   it sends the initial coin data to a web worker for currency transformation. Once the web worker
 *   processes the data and sends it back, the thunk:
 *    - Dispatches the transformed data to the Redux store.
 *    - Caches the transformed data in IndexedDB.
 *
 * @returns {Function} Thunk action.
 */
export const initializePopularCoinsListCache = createAsyncThunk(
  "coins/initializePopularCoinsListCache",
  async (options = { indexedDBCacheIsValid: null }, { dispatch, getState }) => {
    const state = getState();
    const initialHundredCoins = state.coins.displayedPopularCoinsList;
    const currencyRates = state.currency.currencyRates;
    const currentCurrency = state.currency.currentCurrency;
    const { indexedDBCacheIsValid } = options;
    console.log("initializePopularCoinsListCache thunk active", state);

    const isCacheValid =
      indexedDBCacheIsValid != null
        ? indexedDBCacheIsValid
        : await validateCacheDataForTable(POPULARCOINSLISTS_TABLENAME);

    // If data isn't in the cache, or the cache isn't valid, send the initial data to the web worker
    // for currency transformation. After that, we save it to the cache
    if (!isCacheValid) {
      if (indexedDBCacheIsValid === false) {
        console.log(
          "INVALID COIN LISTS CACHE (Skipped extra validateCacheDataForTable call) - initializePopularCoinsListCache",
        );
      } else {
        console.log(
          "INVALID COIN LISTS CACHE - initializePopularCoinsListCache",
        );
      }

      if (typeof window !== "undefined") {
        postMessageToCurrencyTransformerWorker({
          type: "transformAllPopularCoinsListCurrencies",
          data: {
            coinsToTransform: initialHundredCoins,
            fromCurrency: currentCurrency.toUpperCase(),
            currencyRates: currencyRates,
            // We start off with the initial coins for the current currency, so we can exclude it to avoid
            // an unnecessary computation
            currenciesToExclude: [currentCurrency],
          },
        });

        // Store initial data in Redux
        dispatch(
          coinsActions.setPopularCoinsListForCurrency({
            currency: currentCurrency.toUpperCase(),
            coinData: initialHundredCoins,
          }),
        );

        // Store initial data in cache
        await saveCoinDataForCurrencyInBrowser(
          POPULARCOINSLISTS_TABLENAME,
          currentCurrency.toUpperCase(),
          initialHundredCoins,
        ).then(() =>
          console.log(
            "REDUX CACHE INITIALIZED - initializePopularCoinsListCache thunk",
          ),
        );

        return storeCurrencyRatesInIndexedDB(currencyRates);
      }
    } else {
      console.log(
        "VALID COIN LISTS CACHE - initializePopularCoinsListCache thunk",
      );

      return db.popularCoinLists
        .each((data) => {
          if (
            data.currency !== currentCurrency.toUpperCase() &&
            data?.coinData
          ) {
            dispatch(
              coinsActions.setPopularCoinsListForCurrency({
                currency: data.currency,
                coinData: data.coinData,
              }),
            );
          }
        })
        .catch((err) =>
          console.error("Error fetching data from IndexedDB:", err),
        )
        .finally(() =>
          console.log(
            "REDUX CACHE INITIALIZED - initializePopularCoinsListCache thunk",
          ),
        );
    }
  },
);
