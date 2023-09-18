import { coinsActions } from "../store/coins";
import {
  COINDETAILS_TABLENAME,
  COINLISTS_TABLENAME,
  SYMBOLS_BY_CURRENCIES,
} from "../global/constants";
import { saveCoinDataForCurrencyInBrowser } from "./cache.utils";

// Initialize the web worker
const currencyTransformerWorker = new Worker(
  "/webWorkers/currencyTransformerWorker.js",
);

/**
 * Initializes and sets up the message listener for the currencyTransformerWorker.
 *
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {string} updatedCurrency - The currency to which coins need to be updated.
 */
export function initializeCurrencyTransformerWorker(dispatch, updatedCurrency) {
  // Listen for messages from the web worker
  currencyTransformerWorker.onmessage = ({ data }) => {
    const { transformedData } = data;

    if (type === "transformCoinListCurrency") {
      const trendingCoins = transformedData.slice(0, 10);

      // Dispatch the transformed data to the Redux store
      dispatch(
        coinsActions.updateCoins({
          displayedCoinListCoins: transformedData,
          trendingCarouselCoins: trendingCoins,
          symbol: SYMBOLS_BY_CURRENCIES[updatedCurrency],
        }),
      );

      saveCoinDataForCurrencyInBrowser(
        COINLISTS_TABLENAME,
        updatedCurrency,
        transformedData,
      );
    } else if (type === "transformCoinDetailsCurrency") {
      
      saveCoinDataForCurrencyInBrowser(
        COINDETAILS_TABLENAME,
        updatedCurrency,
        transformedData,
      );
    }
  };
}

/**
 * Posts a message to the currencyTransformerWorker to initiate the currency transformation process.
 *
 * @param {Object} data - The data to send to the web worker for processing.
 */
export function postMessageToCurrencyTransformerWorker(data) {
  currencyTransformerWorker.postMessage(data);
}
