import {
  isCacheValid,
  saveCoinDataForCurrencyInBrowser,
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
    console.log("cacheThunk active");
    const state = getState();
    const initialHundredCoins = state.coins.displayedCoinListCoins;
    const initialRates = state.currency.currencyRates;
    const currentCurrency = state.currency.currentCurrency;

    // If data isn't in the cache, or the cache isn't valid, send the initial data to the web worker
    // for currency transformation. After that, we save it to the cache
    if (!isCacheValid(COINLISTS_TABLENAME)) {
      console.log("INVALID CACHE");
      if (typeof window !== "undefined") {
        postMessageToCurrencyTransformerWorker({
          type: "transformAllCoinListCurrencies",
          data: {
            coinsToTransform: initialHundredCoins,
            fromCurrency: currentCurrency.toUpperCase(),
            currencyRates: initialRates,
            // We start off with the initial coins for the current currency, so we can exclude it to avoid
            // an unnecessary computation
            currencyToExclude: currentCurrency,
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
      console.log("VALID CACHE");

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

/**
 * Handles the transformed data from the web worker by dispatching it to Redux,
 * and then saving it to IndexedDB.
 *
 * @param {MessageEvent} event - The web worker message event.
 * @param {Function} dispatch - Redux dispatch function.
 * @param {string} currentCurrency - The initial currency.
 * @param {Object[]} initialHundredCoins - The initial list of coins.
 */
async function handleTransformedDataFromWorker(
  event,
  dispatch,
  currentCurrency,
  initialHundredCoins,
) {
  const { transformedData, type, toCurrency } = event.data;
  console.log("handleTransformedDataFromWorker", transformedData);

  const storagePromises = [];

  for (const currency in transformedData) {
    // Store transformed coin data in Redux
    dispatch(
      coinsActions.setCoinListForCurrency({
        currency,
        coinData: transformedData[currency],
      }),
    );

    // Cache transformed data
    storagePromises.push(
      saveCoinDataForCurrencyInBrowser(
        COINLISTS_TABLENAME,
        currency,
        transformedData[currency],
      ),
    );
  }

  // Store initial data in Redux
  dispatch(
    coinsActions.setCoinListForCurrency({
      currency: currentCurrency.toUpperCase(),
      coinData: initialHundredCoins,
    }),
  );

  // Cache initial data
  storagePromises.push(
    saveCoinDataForCurrencyInBrowser(
      COINLISTS_TABLENAME,
      currentCurrency.toUpperCase(),
      initialHundredCoins,
    ),
  );

  // Wait for all storage operations to complete
  try {
    await Promise.all(storagePromises);
  } catch (err) {
    console.error("Error during IndexedDB storage:", err);
  }
}
