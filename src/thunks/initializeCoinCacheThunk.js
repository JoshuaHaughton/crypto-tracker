import {
  saveTableDataForCurrencyInIndexedDB,
  storeCurrencyRatesInIndexedDB,
  validateCacheDataForTable,
} from "../utils/cache.utils";
import { coinsActions } from "../store/coins";
import db from "../utils/database";
import {
  COINDETAILS_TABLENAME,
  POPULARCOINSLISTS_TABLENAME,
} from "../global/constants";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { mapPopularCoinsToShallowDetailedAttributes } from "../utils/dataFormat.utils";
import { appInfoActions } from "../store/appInfo";

/**
 * Async thunk to manage caching of both PopularCoinsList, and the shallow details data for multiple currencies.
 *
 * The thunk performs the following:
 *
 * - Verifies if the popularCoinsList data exists in the cache (IndexedDB) and is valid:
 *   - If valid, it dispatches the cached data to the Redux store.
 *   - Simultaneously, it also computes and dispatches the shallow coin details derived from the popularCoinsList.
 *
 * - If the cache is invalid or the data doesn't exist:
 *   - Sends the initial popularCoinsList data to a web worker for currency transformation.
 *   - Upon receiving the transformed data from the web worker:
 *     - Dispatches the transformed popularCoinsList to the Redux store.
 *     - Computes and dispatches the shallow coin details.
 *     - Caches the transformed popularCoinsList, the shallow details, & the currencyRates in IndexedDB.
 * - Note: Requires the popularCoinsList to be fully populated in state before iniitiation.
 *
 * @param {Object} options - Options object.
 * @param {boolean} [options.indexedDBCacheIsValid] - A flag indicating whether the cache is valid or not. If provided, will bypass the indexedDB validity check.
 * @returns {Function} Thunk action.
 */
export const initializePopularCoinsAndDetailsCache = createAsyncThunk(
  "coins/initializePopularCoinsAndDetailsCache",
  async (options = {}, { dispatch, getState }) => {
    const state = getState();
    const { indexedDBCacheIsValid } = options;
    const popularCoinsList = state.coins.displayedPopularCoinsList;
    dispatch(appInfoActions.startPopularCoinsListsHydration());
    // Used as the shallow details for coins so we can have consistent pricing throughout the app instead of fetching data that is slightly different from the API
    const shallowCoinDetails =
      mapPopularCoinsToShallowDetailedAttributes(popularCoinsList);
    const currencyRates = state.currency.currencyRates;
    const currentCurrency = state.currency.currentCurrency;
    console.log("initializePopularCoinsAndDetailsCache thunk active", state);

    const isCacheValid =
      indexedDBCacheIsValid != null
        ? indexedDBCacheIsValid
        : await validateCacheDataForTable(POPULARCOINSLISTS_TABLENAME);

    // If data isn't in the cache, or the cache isn't valid, send the initial data to the web worker
    // for currency transformation. After that, we save it to the cache
    if (!isCacheValid) {
      if (indexedDBCacheIsValid === false) {
        console.log(
          "SKIPPED POPULARCOINSLISTS CACHE (Skipped extra validateCacheDataForTable call) - initializePopularCoinsAndDetailsCache",
        );
      } else {
        console.log(
          "INVALID POPULARCOINSLISTS CACHE - initializePopularCoinsAndDetailsCache",
        );
      }

      if (typeof window !== "undefined") {
        postMessageToCurrencyTransformerWorker({
          type: "transformAllPopularCoinsListCurrencies",
          data: {
            coinsToTransform: popularCoinsList,
            fromCurrency: currentCurrency.toUpperCase(),
            currencyRates: currencyRates,
            // We start off with the initial coins for the current currency, so we can exclude it to avoid
            // an unnecessary computation
            currenciesToExclude: [currentCurrency],
          },
        });

        // Store initial PopularCoins data in Redux
        dispatch(
          coinsActions.setPopularCoinsListForCurrency({
            currency: currentCurrency.toUpperCase(),
            coinData: popularCoinsList,
          }),
        );

        // Store initial Shallow Coin Details data in Redux
        dispatch(
          coinsActions.setCachedCoinDetailsByCurrency({
            currency: currentCurrency.toUpperCase(),
            coinData: shallowCoinDetails,
          }),
        );

        // Store initial data in cache
        await saveTableDataForCurrencyInIndexedDB(
          POPULARCOINSLISTS_TABLENAME,
          currentCurrency.toUpperCase(),
          popularCoinsList,
        ).then(() =>
          console.log(
            "POPULARCOINSLISTS CACHE INITIALIZED - initializePopularCoinsAndDetailsCache thunk",
          ),
        );

        return storeCurrencyRatesInIndexedDB(currencyRates);
      }
    } else {
      console.log(
        "VALID COIN LISTS CACHE - initializePopularCoinsAndDetailsCache thunk",
      );

      return db[POPULARCOINSLISTS_TABLENAME].each((data) => {
        if (data.currency !== currentCurrency.toUpperCase() && data?.coinData) {
          dispatch(
            coinsActions.setPopularCoinsListForCurrency({
              currency: data.currency,
              coinData: data.coinData,
            }),
          );
          dispatch(
            coinsActions.setCachedCoinDetailsByCurrency({
              currency: data.currency,
              coinData: mapPopularCoinsToShallowDetailedAttributes(
                data.coinData,
              ),
            }),
          );
        }
      })
        .catch((err) =>
          console.error("Error fetching data from IndexedDB:", err),
        )
        .finally(() =>
          console.log(
            "REDUX CACHE INITIALIZED - initializePopularCoinsAndDetailsCache thunk",
          ),
        );
    }

    dispatch(appInfoActions.finishPopularCoinsListsHydration());
  },
);
