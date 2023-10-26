import {
  COINDETAILS_TABLENAME,
  POPULARCOINSLISTS_TABLENAME,
} from "../../../src/global/constants";
import { coinsActions } from "../../../src/store/coins";
import { currencyActions } from "../../../src/store/currency";
import { saveCoinDataForCurrencyInBrowser } from "../../../src/utils/cache.utils";

export const TRANSFORM_COIN_DETAILS_CURRENCY = "transformCoinDetailsCurrency";
export const TRANSFORM_ALL_COIN_DETAILS_CURRENCIES =
  "transformAllCoinDetailsCurrencies";
export const TRANSFORM_POPULAR_COINS_LIST_CURRENCY =
  "transformPopularCoinsListCurrency";
export const TRANSFORM_ALL_POPULAR_COINS_LIST_CURRENCIES =
  "transformAllPopularCoinsListCurrencies";

/**
 * Handles the storage of transformed coin details for a specific currency. To be used when the cache isn't available, and a tranformation needs to be done on the fly - which is why we need to dispatch the currencyCHange right after the transformation completes. It then stores the transformed data in Redux and saves it to the browser's IndexedDB.
 *
 * This function is typically used in the context of the currency transformer worker's
 * message event, specifically for the "transformCoinDetailsCurrency" message type.
 *
 * @async
 * @param {Object} transformedData - Transformed Data received from the worker.
 * @param {Object} toCurrency - The currency to update to.
 * @param {Function} dispatch - Redux dispatch function.
 */
async function handleTransformedCoinDetailSForCurrency(
  transformedData,
  toCurrency,
  dispatch,
) {
  batch(() => {
    // Store transformed coin data in Redux
    dispatch(
      coinsActions.updateSelectedCoin({
        coinDetails: transformedData,
      }),
    );
    dispatch(
      coinsActions.setCachedCoinDetailsByCurrency({
        currency: toCurrency,
        coinData: transformedData,
      }),
    );
    dispatch(currencyActions.changeCurrency({ currency: toCurrency }));
  });

  // Wait for all storage operations to complete
  try {
    await saveCoinDataForCurrencyInBrowser(
      COINDETAILS_TABLENAME,
      toCurrency,
      transformedData,
    );
  } catch (err) {
    console.error("Error during IndexedDB storage:", err);
  }
}

/**
 * Handles the storage of transformed coin details for multiple currencies.
 * Stores the transformed data for each currency in Redux and saves it to the browser's IndexedDB.
 *
 * This function is typically used in the context of the currency transformer worker's
 * message event, specifically for the "transformAllCoinDetailsCurrencies" message type.
 *
 * @function
 * @async
 * @param {Object} transformedData - The transformed coin details data, indexed by currency.
 * @param {Function} dispatch - The Redux dispatch function.
 */
async function handleTransformedCoinDetailsForMultipleCurrencies(
  transformedData,
  dispatch,
) {
  const storagePromises = [];

  for (const currency in transformedData) {
    // Store transformed coin data in Redux
    dispatch(
      coinsActions.setCachedCoinDetailsByCurrency({
        currency,
        coinData: transformedData[currency],
      }),
    );

    // Prepare transformed data for cache
    storagePromises.push(
      saveCoinDataForCurrencyInBrowser(
        COINDETAILS_TABLENAME,
        currency,
        transformedData[currency],
      ),
    );
  }

  // Wait for all storage operations to complete
  try {
    await Promise.all(storagePromises);
  } catch (err) {
    console.error("Error during IndexedDB storage:", err);
  }
}

/**
 * Handles the storage of transformed popular coins list for a specific currency. To be used when the cache isn't available, and a tranformation needs to be done on the fly - which is why we need to dispatch the currencyCHange right after the
 * transformation completes. It then Stores the transformed list in Redux, saves a subsection for trending carousel coins,
 * and saves the entire list to the browser's IndexedDB.
 *
 * This function is typically used in the context of the currency transformer worker's
 * message event, specifically for the "transformPopularCoinsListCurrency" message type.
 *
 * @function
 * @async
 * @param {Array} transformedData - The already transformed popular coins list data.
 * @param {string} toCurrency - The currency to update to.
 * @param {Function} dispatch - The Redux dispatch function.
 */
async function handleTransformedPopularCoinsForCurrency(
  transformedData,
  toCurrency,
  dispatch,
) {
  batch(() => {
    // Store transformed coin data in Redux
    dispatch(
      coinsActions.updateCoins({
        displayedPopularCoinsList: transformedData,
        trendingCarouselCoins: transformedData.slice(0, 10),
      }),
    );
    dispatch(
      coinsActions.setPopularCoinsListForCurrency({
        toCurrency,
        coinData: transformedData,
      }),
    );
    dispatch(currencyActions.changeCurrency({ currency: toCurrency }));
  });

  // Wait for all storage operations to complete
  try {
    await saveCoinDataForCurrencyInBrowser(
      POPULARCOINSLISTS_TABLENAME,
      toCurrency,
      transformedData,
    );
  } catch (err) {
    console.error("Error during IndexedDB storage:", err);
  }
}

/**
 * Handles the storage of transformed popular coins lists for multiple currencies.
 * Stores the transformed lists for each currency in Redux and saves them to the browser's IndexedDB.
 *
 * This function is typically used in the context of the currency transformer worker's
 * message event, specifically for the "transformAllPopularCoinsListCurrencies" message type.
 *
 * @function
 * @async
 * @param {Object} transformedData - The already transformed popular coins lists data, indexed by currency.
 * @param {Function} dispatch - The Redux dispatch function.
 */
async function handleTransformedPopularCoinsForMultipleCurrencies(
  transformedData,
  dispatch,
) {
  const storagePromises = [];

  for (const currency in transformedData) {
    // Store transformed coin data in Redux
    dispatch(
      coinsActions.setPopularCoinsListForCurrency({
        currency,
        coinData: transformedData[currency],
      }),
    );

    // Prepare transformed data for cache
    storagePromises.push(
      saveCoinDataForCurrencyInBrowser(
        POPULARCOINSLISTS_TABLENAME,
        currency,
        transformedData[currency],
      ),
    );
  }

  // Wait for all storage operations to complete
  try {
    await Promise.all(storagePromises);
  } catch (err) {
    console.error("Error during IndexedDB storage:", err);
  }
}

/**
 * Handles the onmessage event of the currencyTransformerWorker.
 *
 * This function is triggered when the currencyTransformerWorker has completed
 * a currency transformation task. Depending on the type of transformation,
 * the appropriate utility function is called to handle the storage
 * of the transformed data in both Redux and the browser's IndexedDB.
 *
 * This function acts as a central hub in the lifecycle of the currency transformer,
 * ensuring that transformed data is properly stored and managed.
 *
 * @param {MessageEvent} event - The onmessage event object.
 * @param {Function} dispatch - The Redux dispatch function.
 */
export async function handleCurrencyTransformerMessage(event, dispatch) {
  const { transformedData, type, toCurrency } = event.data;
  console.log(`currencyTransformerWorker message received - ${type}`);

  switch (type) {
    case TRANSFORM_COIN_DETAILS_CURRENCY:
      await handleTransformedCoinDetailSForCurrency(
        transformedData,
        toCurrency,
        dispatch,
      );
      break;

    case TRANSFORM_ALL_COIN_DETAILS_CURRENCIES:
      await handleTransformedCoinDetailsForMultipleCurrencies(
        transformedData,
        dispatch,
      );
      break;

    case TRANSFORM_POPULAR_COINS_LIST_CURRENCY:
      await handleTransformedPopularCoinsForCurrency(
        transformedData,
        toCurrency,
        dispatch,
      );
      break;

    case TRANSFORM_ALL_POPULAR_COINS_LIST_CURRENCIES:
      await handleTransformedPopularCoinsForMultipleCurrencies(
        transformedData,
        dispatch,
      );
      break;

    default:
      console.warn(`Unknown message type received: ${type}`);
  }

  console.log(`currencyTransformerWorker job complete! - ${type}`);
}
