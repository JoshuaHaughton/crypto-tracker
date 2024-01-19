import { TCurrencyString } from "@/lib/constants/globalConstants";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { currencyActions } from "@/lib/store/currency/currencySlice";
import { Dispatch } from "@reduxjs/toolkit";
import { ICoinDetails, ICoinOverview } from "@/types/coinTypes";
import { CTWResponseType } from "./types";

/**
 * Handles the storage of transformed coin details for a specific currency. To be used when the cache isn't available,
 * and a tranformation needs to be done on the fly - which is why we need to dispatch the currencyChange right after the transformation completes.
 * It then stores the transformed data in Redux.
 *
 * @param {ICoinDetails} transformedData - Transformed Data received from the worker.
 * @param {TCurrencyString} toCurrency - The currency to update to.
 * @param {Dispatch} dispatch - Redux dispatch function.
 */
function handleTransformedCoinDetailsForCurrency(
  transformedData: ICoinDetails,
  toCurrency: TCurrencyString,
  dispatch: Dispatch,
) {
  // Store transformed coin data in Redux
  dispatch(
    coinsActions.setSelectedCoinDetails({
      coinDetails: transformedData,
    }),
  );
  dispatch(
    coinsActions.setOrUpdatePreloadedCoinDetails({
      currency: toCurrency,
      coinDetails: transformedData,
    }),
  );
  dispatch(currencyActions.setDisplayedCurrency({ currency: toCurrency }));
}

/**
 * Handles the storage of transformed coin details for multiple currencies.
 * Stores the transformed data for each currency in Redux.
 *
 * @param {ICoinDetails} transformedData - The transformed coin details data, indexed by currency.
 * @param {Dispatch} dispatch - The Redux dispatch function.
 */
function handleTransformedCoinDetailsForMultipleCurrencies(
  transformedData: Record<TCurrencyString, ICoinDetails>,
  dispatch: Dispatch,
) {
  for (const currency in transformedData) {
    // Store transformed coin data in Redux
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
  transformedData: ICoinOverview[],
  toCurrency: TCurrencyString,
  dispatch: Dispatch,
) {
  // Store transformed coin data in Redux
  dispatch(
    coinsActions.setPopularCoins({
      coinList: transformedData,
    }),
  );
  dispatch(
    coinsActions.setCachedPopularCoins({
      currency: toCurrency,
      coinList: transformedData,
    }),
  );
  dispatch(currencyActions.setDisplayedCurrency({ currency: toCurrency }));
}

/**
 * Handles the storage of transformed popular coins lists for multiple currencies.
 * Stores the transformed lists for each currency in Redux.
 *
 * @param {Object} transformedData - The already transformed popular coins lists data, indexed by currency.
 * @param {Function} dispatch - The Redux dispatch function.
 */
function handleTransformedPopularCoinsForMultipleCurrencies(
  transformedData: Record<TCurrencyString, ICoinOverview[]>,
  dispatch: Dispatch,
) {
  console.log(
    "handleTransformedPopularCoinsForMultipleCurrencies",
    transformedData,
  );

  for (const currency in transformedData) {
    // Store transformed PopularCoins data in Redux
    dispatch(
      coinsActions.setCachedPopularCoins({
        currency: currency as TCurrencyString,
        coinList: transformedData[currency as TCurrencyString],
      }),
    );
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
 * @param {Dispatch} dispatch - The Redux dispatch function.
 */
export function handleTransformedCurrencyResponse(
  event: MessageEvent,
  dispatch: Dispatch,
) {
  const { responseType, transformedData, toCurrency } = event.data;
  console.log(`currencyTransformerWorker message received - ${responseType}`);

  switch (responseType) {
    case CTWResponseType.TRANSFORMED_COIN_DETAILS:
      handleTransformedCoinDetailsForCurrency(
        transformedData,
        toCurrency,
        dispatch,
      );
      break;

    case CTWResponseType.TRANSFORMED_ALL_COIN_DETAILS:
      handleTransformedCoinDetailsForMultipleCurrencies(
        transformedData,
        dispatch,
      );
      break;

    case CTWResponseType.TRANSFORMED_POPULAR_COINS_LIST:
      handleTransformedPopularCoinsForCurrency(
        transformedData,
        toCurrency,
        dispatch,
      );
      break;

    case CTWResponseType.TRANSFORMED_ALL_POPULAR_COINS_LIST:
      handleTransformedPopularCoinsForMultipleCurrencies(
        transformedData,
        dispatch,
      );
      break;

    default:
      console.warn(`Unknown message type received: ${responseType}`);
  }

  console.log(`currencyTransformerWorker job complete! - ${responseType}`);
}
