import { Dispatch } from "@reduxjs/toolkit";
import { handleTransformedCurrencyResponse } from "./utils";
import { CTWRequestMessage } from "./types";

/**
 * A reference to the currency transformer worker.
 * @type {Worker}
 */
let currencyTransformerWorker: Worker | undefined;

/**
 * Initializes the currency transformer worker.
 * If the worker is already initialized, we'll use that one.
 *
 * @param {Dispatch} dispatch - Redux dispatch function.
 */
export function initializeCurrencyTransformerWorker(dispatch: Dispatch) {
  // Return if there is an existing worker.
  if (currencyTransformerWorker != null) return;

  // Ensure the worker can be initialized (i.e., running in a browser environment)
  if (typeof window === "undefined") return;

  currencyTransformerWorker = new Worker(
    new URL("./worker.ts", import.meta.url),
  );
  console.log("currencyTransformerWorker created");

  currencyTransformerWorker.onmessage = (event) =>
    handleTransformedCurrencyResponse(event, dispatch);
}

/**
 * Posts a message to the currencyTransformerWorker to initiate the currency transformation process.
 *
 * @param {CTWRequestMessage} message - Data to post to the worker.
 */
export function postMessageToCurrencyTransformerWorker(
  message: CTWRequestMessage,
) {
  if (currencyTransformerWorker) {
    currencyTransformerWorker.postMessage(message);
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
