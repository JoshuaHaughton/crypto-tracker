import { TCurrencyString } from "@/lib/constants/globalConstants";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { Dispatch } from "@reduxjs/toolkit";
import {
  CTWCallbacksMap,
  CTWResponseMessageEvent,
  CTWResponseType,
  CTWCoinDetailsInternalResponseData,
  CTWAllCoinDetailsInternalResponseData,
  CTWPopularCoinsListInternalResponseData,
  CTWAllPopularCoinsListsInternalResponseData,
  CTWCallbackResponse,
} from "./types";

/**
 * Handles the storage of transformed coin details for a specific currency. To be used when the cache isn't available,
 * and a tranformation needs to be done on the fly - which is why we need to dispatch the currencyChange right after the transformation completes.
 * It then stores the transformed data in Redux.
 *
 * @param {ICoinDetails} transformedData - Transformed Data received from the worker.
 * @param {TCurrencyString} toCurrency - The currency to update to.
 * @param {Dispatch} dispatch - Redux dispatch function.
 */
function handleCTWTransformedCoinDetailsForCurrency(
  transformedData: CTWCoinDetailsInternalResponseData["transformedData"],
  toCurrency: TCurrencyString,
  dispatch: Dispatch,
) {
  console.log(
    "transformedData - handleCTWTransformedCoinDetailsForCurrency",
    transformedData,
  );
  dispatch(
    coinsActions.setOrUpdatePreloadedCoinDetails({
      currency: toCurrency,
      coinDetails: transformedData,
    }),
  );
}

/**
 * Handles the storage of transformed coin details for multiple currencies.
 * Stores the transformed data for each currency in Redux.
 *
 * @param {ICoinDetails} transformedData - The transformed coin details data, indexed by currency.
 * @param {Dispatch} dispatch - The Redux dispatch function.
 */
function handleCTWTransformedCoinDetailsForMultipleCurrencies(
  transformedData: CTWAllCoinDetailsInternalResponseData["transformedData"],
  dispatch: Dispatch,
) {
  for (const currency in transformedData) {
    // Store transformed coin data in Redux
    console.log(
      "transformedData - handleCTWTransformedCoinDetailsForMultipleCurrencies",
      transformedData[currency as TCurrencyString],
    );
    dispatch(
      coinsActions.setOrUpdatePreloadedCoinDetails({
        currency: currency as TCurrencyString,
        coinDetails: transformedData[currency as TCurrencyString],
      }),
    );
  }
}

/**
 * Handles the storage of transformed popular coins list for a specific currency. To be used when the cache isn't available, and a tranformation needs to be done on the fly - which is why we need to dispatch the currencyCHange right after the
 * transformation completes. It then Stores the transformed list in Redux, & saves a subsection for trending carousel coins.
 *
 * @param {ICoinOverview} transformedData - The already transformed popular coins list data.
 * @param {TCurrencyString} toCurrency - The currency to update to.
 * @param {Dispatch} dispatch - The Redux dispatch function.
 */
function handleTransformedPopularCoinsForCurrency(
  transformedData: CTWPopularCoinsListInternalResponseData["transformedData"],
  toCurrency: TCurrencyString,
  dispatch: Dispatch,
) {
  dispatch(
    coinsActions.setCachedPopularCoinsMap({
      currency: toCurrency,
      coinList: transformedData,
    }),
  );
}

/**
 * Handles the storage of transformed popular coins lists for multiple currencies.
 * Stores the transformed lists for each currency in Redux.
 *
 * @param {Object} transformedData - The already transformed popular coins lists data, indexed by currency.
 * @param {Function} dispatch - The Redux dispatch function.
 */
function handleTransformedPopularCoinsForMultipleCurrencies(
  transformedData: CTWAllPopularCoinsListsInternalResponseData["transformedData"],
  dispatch: Dispatch,
) {
  console.log(
    "handleTransformedPopularCoinsForMultipleCurrencies",
    transformedData,
  );

  for (const currency in transformedData) {
    // Store transformed PopularCoins data in Redux
    dispatch(
      coinsActions.setCachedPopularCoinsMap({
        currency: currency as TCurrencyString,
        coinList: transformedData[currency as TCurrencyString],
      }),
    );
  }
}

/**
 * Handles the onmessage event of the currencyTransformerWorker.
 *
 * This function is activated when the currencyTransformerWorker completes
 * a currency transformation task. Based on the type of transformation, it invokes the appropriate
 * utility function to store the transformed data in both Redux and IndexedDB.
 *
 * Additionally, this function manages the execution of any callback functions associated with the worker task.
 * These callbacks, stored in `callbacksMap`, are executed immediately after the worker's task is completed,
 * allowing for timely and context-specific updates to the application state or UI.
 *
 * @param {CTWResponseMessageEvent} event - The onmessage event object from the worker.
 * @param {Dispatch} dispatch - Redux dispatch function for updating application state.
 * @param {CTWCallbacksMap} callbacksMap - A map of callback functions to be executed after the worker's task completion.
 */
export function handleTransformedCurrencyResponse(
  event: CTWResponseMessageEvent,
  dispatch: Dispatch,
  callbacksMap: CTWCallbacksMap,
) {
  const { responseType, onCompleteCallbackId } = event.data;
  console.log(`currencyTransformerWorker message received - ${responseType}`);

  switch (responseType) {
    case CTWResponseType.COIN_DETAILS_SINGLE_CURRENCY: {
      const { transformedData, toCurrency } =
        event.data as CTWCoinDetailsInternalResponseData;
      handleCTWTransformedCoinDetailsForCurrency(
        transformedData,
        toCurrency,
        dispatch,
      );
      break;
    }
    case CTWResponseType.COIN_DETAILS_ALL_CURRENCIES: {
      const { transformedData } =
        event.data as CTWAllCoinDetailsInternalResponseData;
      handleCTWTransformedCoinDetailsForMultipleCurrencies(
        transformedData,
        dispatch,
      );
      break;
    }
    case CTWResponseType.POPULAR_COINS_SINGLE_CURRENCY: {
      const { transformedData, toCurrency } =
        event.data as CTWPopularCoinsListInternalResponseData;
      handleTransformedPopularCoinsForCurrency(
        transformedData,
        toCurrency,
        dispatch,
      );
      break;
    }
    case CTWResponseType.POPULAR_COINS_ALL_CURRENCIES: {
      const { transformedData } =
        event.data as CTWAllPopularCoinsListsInternalResponseData;
      handleTransformedPopularCoinsForMultipleCurrencies(
        transformedData,
        dispatch,
      );
      break;
    }
    default:
      console.warn(`Unknown message type received: ${responseType}`);
  }

  // Execute the callback if an onCompleteCallbackId is provided
  if (onCompleteCallbackId) {
    if (callbacksMap.has(onCompleteCallbackId)) {
      const callback = callbacksMap.get(onCompleteCallbackId);
      if (callback) {
        console.warn(
          "calling currencyTransformerWorker callback",
          onCompleteCallbackId,
        );
        // Create a response object that includes both responseType and transformedData
        const callbackResponse: CTWCallbackResponse = {
          responseType: responseType,
          transformedData: event.data.transformedData,
        };

        // Invoke the callback with the response object
        callback(callbackResponse);
        // Delete the callback after it's been called to free up memory
        callbacksMap.delete(onCompleteCallbackId);
      }
    } else {
      // Throw an error if onCompleteCallbackId is provided but not found in the map
      throw new Error(
        `Callback with ID ${onCompleteCallbackId} not found in callbacksMap.`,
      );
    }
  }

  console.log(`currencyTransformerWorker job complete! - ${responseType}`);
}

/**
 * Generates a unique identifier string for callback functions.
 * This function combines the current timestamp with a random number to ensure a high probability of uniqueness.
 * The generated ID is used to map callbacks to specific worker tasks in `callbacksMap`.
 *
 * The uniqueness is achieved by:
 * - Using `Date.now()` to get a timestamp, ensuring temporal uniqueness.
 * - Appending a random string generated from `Math.random()`, enhancing overall uniqueness.
 *
 * This approach provides a simple yet effective way to generate unique IDs without additional dependencies.
 *
 * @returns {string} A unique identifier string.
 */
export function generateUniqueOnCompleteCallbackId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
