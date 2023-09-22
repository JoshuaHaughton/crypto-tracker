import { batch } from "react-redux";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import {
  COINDETAILS_TABLENAME,
  COINLISTS_TABLENAME,
} from "../global/constants";
import { saveCoinDataForCurrencyInBrowser } from "./cache.utils";

/**
 * A reference to the currency transformer worker.
 * @type {Worker}
 */
let currencyTransformerWorker;

/**
 * Initializes the currency transformer worker.
 * If the worker is already initialized, it will be overwritten.
 *
 * @param {Function} dispatch - Redux dispatch function.
 */
export function initializeCurrencyTransformerWorker(dispatch) {
  // Terminate the existing worker if already initialized
  if (currencyTransformerWorker != null) {
    terminateCurrencyTransformerWorker();
  }

  // Ensure the worker can be initialized (i.e., running in a browser environment)
  if (typeof window === "undefined") return;

  currencyTransformerWorker = new Worker(
    "/webWorkers/currencyTransformerWorker.js",
  );
  console.log("currencyTransformerWorker created");

  currencyTransformerWorker.onmessage = async (event) => {
    console.log("currencyTransformerWorker message received");

    const { transformedData, type } = event.data;
    console.log("handleTransformedDataFromWorker", transformedData);

    if (type === "transformAllCoinListCurrencies") {
      const storagePromises = [];

      for (const currency in transformedData) {
        // Store transformed coin data in Redux
        dispatch(
          coinsActions.setCoinListForCurrency({
            currency,
            coinData: transformedData[currency],
          }),
        );

        // Prepare transformed data for cache
        storagePromises.push(
          saveCoinDataForCurrencyInBrowser(
            COINLISTS_TABLENAME,
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
    console.log("currencyTransformerWorker terminated");
  }
}
