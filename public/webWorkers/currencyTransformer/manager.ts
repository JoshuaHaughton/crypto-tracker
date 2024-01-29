import { Dispatch } from "@reduxjs/toolkit";
import {
  generateUniqueOnCompleteCallbackId,
  handleTransformedCurrencyResponse,
} from "./utils";
import {
  CTWRequestMessage,
  CTWCallbacksMap,
  CTWMessageRequestType,
  CTWCallback,
} from "./types";

/**
 * A map to store callback functions associated with specific worker tasks.
 * Each task is given a unique identifier, and its corresponding callback is stored in this map.
 * This approach ensures that we can perform specific actions (like updating the Redux store or UI)
 * immediately after a worker task completes, providing a more responsive and efficient application.
 *
 * The map is global to the manager module, ensuring it persists throughout the lifetime of the application.
 * This persistence is crucial for handling long-running or numerous asynchronous tasks initiated by the worker.
 */
const callbacksMap: CTWCallbacksMap = new Map();

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
    handleTransformedCurrencyResponse(event, dispatch, callbacksMap);
}

/**
 * Posts a message to the currencyTransformerWorker to initiate the currency transformation process.
 * Optionally accepts a callback function, which will be invoked once the worker task associated
 * with the message is completed. This allows for immediate and context-specific reactions to the worker's task completion.
 *
 * @param {CTWRequestMessage} message - Data to post to the worker.
 */
export function postMessageToCurrencyTransformerWorker<
  T extends CTWMessageRequestType,
>(message: CTWRequestMessage<T>) {
  if (!currencyTransformerWorker) return;
  const { requestData, requestType, onComplete } = message;

  const onCompleteCallbackId =
    onComplete != null ? generateUniqueOnCompleteCallbackId() : undefined;

  if (onCompleteCallbackId && onComplete != null) {
    callbacksMap.set(onCompleteCallbackId, onComplete as CTWCallback);
  }

  currencyTransformerWorker.postMessage({
    requestData,
    requestType,
    onCompleteCallbackId,
  });
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
