import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { TCurrencyString } from "@/lib/constants/globalConstants";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { TCurrencyExchangeRates } from "@/types/currencyTypes";
import { ICoinDetails } from "@/types/coinTypes";
import { CTWMessageRequestType } from "../../public/webWorkers/currencyTransformer/types";

interface IPreloadFetchedCoinDetailsOptions {
  dispatch: Dispatch;
  coinDetails: ICoinDetails;
  currentCurrency: TCurrencyString;
  currencyExchangeRates: TCurrencyExchangeRates;
}

/**
 * Initializes the preloading of freshly fetched coin details.
 * It synchronously updates the Redux store with the CoinDetails for the current currency, & asynchronously transforms coin details for all other currencies using a web worker.
 *
 * @param {IPreloadFetchedCoinDetailsOptions} options - The options for preloading fetched coin details.
 */
export function preloadFetchedCoinDetails(
  options: IPreloadFetchedCoinDetailsOptions,
): void {
  const { dispatch, coinDetails, currentCurrency, currencyExchangeRates } =
    options;
  const coinId = coinDetails.id;

  console.warn(`Preloading details for coin ${coinId}`, coinDetails);

  // Posts a message to the web worker for transforming the coin details across multiple currencies. Once complete,
  // the worker will handle dispatching the data to Redux state.
  // This efficiently handles data processing in the background to avoid UI blocking.
  postMessageToCurrencyTransformerWorker({
    requestType: CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES,
    requestData: {
      coinToTransform: coinDetails,
      fromCurrency: currentCurrency,
      currenciesToExclude: [currentCurrency],
      currencyExchangeRates,
    },
  });

  // Updates preloaded coin details in Redux store, ensuring UI consistency.
  // Utilizes shallow data from popular coins list to maintain uniformity in images and prices.
  // Overwrites null properties with existing data, or sets new details as needed.
  // Balances immediate display from shallow data with detailed fetched information.
  dispatch(
    coinsActions.setOrUpdatePreloadedCoinDetails({
      currency: currentCurrency,
      coinDetails,
    }),
  );
}
