import { batch } from "react-redux";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";

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

  currencyTransformerWorker.onmessage = (event) => {
    console.log("currencyTransformerWorker message received");

    const { transformedData, type, toCurrency } = event.data;

    batch(() => {
      if (type === "transformCoinListCurrency") {
        const trendingCoins = transformedData.slice(0, 10);

        dispatch(
          coinsActions.updateCoins({
            displayedCoinListCoins: transformedData,
            trendingCarouselCoins: trendingCoins,
          }),
        );
      } else if (type === "transformCoinDetailsCurrency") {
        dispatch(
          coinsActions.updateSelectedCoin({
            coinDetails: transformedData,
          }),
        );
      }

      dispatch(currencyActions.changeCurrency({ currency: toCurrency }));
    });
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
