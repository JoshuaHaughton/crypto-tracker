import {
  saveTableDataForCurrencyInIndexedDB,
  storeCurrencyRatesInIndexedDB,
  validateCacheDataForTable,
} from "../utils/cache.utils";
import db from "../utils/database";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { mapPopularCoinsToShallowDetailedAttributes } from "../utils/dataFormat.utils";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { POPULARCOINSLISTS_TABLENAME } from "@/lib/constants/globalConstants";

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
 * @returns {Function} Thunk action.
 */
export const initializePopularCoinsAndDetailsCache = createAsyncThunk(
  "coins/initializePopularCoinsAndDetailsCache",
  async (options = {}, { dispatch, getState }) => {
    const state = getState();
    const popularCoinsList = state.coins.popularCoins;
    dispatch(appInfoActions.startPopularCoinsPreloading());
    // Used as the shallow details for coins so we can have consistent pricing throughout the app instead of fetching data that is slightly different from the API
    const shallowCoinDetails =
      mapPopularCoinsToShallowDetailedAttributes(popularCoinsList);
    const currencyExchangeRates = state.currency.currencyRates;
    const currentCurrency = state.currency.currentCurrency;
    console.log("initializePopularCoinsAndDetailsCache thunk active", state);

    // const isCacheValid =
    //   indexedDBCacheIsValid != null
    //     ? indexedDBCacheIsValid
    //     : await validateCacheDataForTable(POPULARCOINSLISTS_TABLENAME);

    // If data isn't in the cache, or the cache isn't valid, send the initial data to the web worker
    // for currency transformation. After that, we save it to the cache
    if (!isCacheValid) {
      // if (indexedDBCacheIsValid === false) {
      //   console.log(
      //     "SKIPPED POPULARCOINSLISTS CACHE (Skipped extra validateCacheDataForTable call) - initializePopularCoinsAndDetailsCache",
      //   );
      // } else {
      //   console.log(
      //     "INVALID POPULARCOINSLISTS CACHE - initializePopularCoinsAndDetailsCache",
      //   );
      // }

      if (typeof window !== "undefined") {
        postMessageToCurrencyTransformerWorker({
          requestType:
            CTWRequestType.TRANSFORM_ALL_POPULAR_COINS_LIST_CURRENCIES,
          requestData: {
            coinsToTransform: popularCoinsList,
            fromCurrency: currentCurrency.toUpperCase(),
            currencyExchangeRates,
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
    }

    dispatch(appInfoActions.stopPopularCoinsPreloading());
  },
);
