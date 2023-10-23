import { batch } from "react-redux";
import { saveCoinDataForCurrencyInBrowser } from "../../../src/utils/cache.utils";
import { currencyActions } from "../../../src/store/currency";
import { coinsActions } from "../../../src/store/coins";
import {
  COINDETAILS_TABLENAME,
  POPULARCOINSLISTS_TABLENAME,
} from "../../../src/global/constants";

/**
 * A reference to the currency transformer worker.
 * @type {Worker}
 */
let currencyTransformerWorker;

/**
 * Initializes the currency transformer worker.
 * If the worker is already initialized, we'll use that one.
 *
 * @param {Function} dispatch - Redux dispatch function.
 */
export function initializeCurrencyTransformerWorker(dispatch) {
  // Return if there is an existing worker.
  if (currencyTransformerWorker != null) return;

  // Ensure the worker can be initialized (i.e., running in a browser environment)
  if (typeof window === "undefined") return;

  currencyTransformerWorker = new Worker(
    "/webWorkers/currencyTransformer/worker.js",
  );
  console.log("currencyTransformerWorker created");

  currencyTransformerWorker.onmessage = async (event) => {
    const { transformedData, type, toCurrency } = event.data;
    console.log(`currencyTransformerWorker message received - ${type}`);

    if (type === "transformCoinDetailsCurrency") {
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

    if (type === "transformAllCoinDetailsCurrencies") {
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

    if (type === "transformPopularCoinsListCurrency") {
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

    if (type === "transformAllPopularCoinsListCurrencies") {
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
    console.log(`currencyTransformerWorker job complete! - ${type}`);
  };
}

/**
 * Posts a message to the currencyTransformerWorker to initiate the currency transformation process.
 *
 * @param {Object} messageData - Data to post to the worker.
 */
export function postMessageToCurrencyTransformerWorker(messageData) {
  if (currencyTransformerWorker) {
    currencyTransformerWorker.postMessage(messageData);
  }
}

/**
 * Terminates the currency transformer worker and cleans up associated resources.
 */
export function terminateCurrencyTransformerWorker() {
  if (currencyTransformerWorker) {
    currencyTransformerWorker.onmessage = null;
    currencyTransformerWorker.terminate();
    currencyTransformerWorker = undefined;
    console.log("currencyTransformerWorker terminated");
  }
}
