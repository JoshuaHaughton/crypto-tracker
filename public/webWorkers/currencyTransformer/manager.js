import { handleCurrencyTransformerMessage } from "./utils";

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
  currencyTransformerWorker.onmessage = (event) =>
    handleCurrencyTransformerMessage(event, dispatch);
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
