import { clearCacheForCurrency, isCacheValid } from "./cache.utils";

/**
 * Manages the caching of coin data and handles worker responses for currency transformation.
 */
export class CoinCacheManager {
  /**
   * Creates an instance of the CoinCacheManager.
   * @param {Function} dispatch - The Redux dispatch function.
   * @param {string} initialCurrency - The initial currency for the app.
   * @param {Array} initialRates - The initial exchange rates.
   */
  constructor(dispatch, initialCurrency, initialRates) {
    this.dispatch = dispatch;
    this.initialCurrency = initialCurrency;
    this.initialRates = initialRates;
    this.currencyTransformerWorker = null; // Set to null initially. We set this when we're sure we're in the Browser
  }

  /**
   * Initializes the cache manager. It clears invalid cache and initializes the currency transformer worker.
   */
  init() {
    this._clearInvalidCache();
    if (typeof window !== "undefined") {
      // Ensure this runs only in the browser
      this.currencyTransformerWorker = new Worker(
        "/webWorkers/currencyTransformerWorker.js",
      );
      this._initializeWorker();
    }
  }

  /**
   * Clears the cache for invalid currency values.
   * @private
   */
  _clearInvalidCache() {
    if (!isCacheValid()) {
      ["USD", "CAD", "AUD", "GBP"].forEach(clearCacheForCurrency);
    }
  }

  /**
   * Initializes the currency transformer worker and sets up an event listener for it.
   * @private
   */
  _initializeWorker() {
    this.currencyTransformerWorker.addEventListener(
      "message",
      this._handleWorkerMessage,
    );
  }

  /**
   * Handles the message event from the currency transformer worker.
   * @param {Event} e - The message event.
   * @private
   */
  _handleWorkerMessage = (e) => {
    const { transformedCoins } = e.data;
    // This base manager only knows how to handle the cache.
    // The specifics of each page on how to utilize the transformedCoins will be handled by the extended managers.
    this.handleTransformedCoins(transformedCoins);
  };

  /**
   * Handles the transformed coins data. This is a placeholder and should be overridden by extended managers.
   * @param {Array} transformedCoins - The transformed coin data.
   */
  handleTransformedCoins(transformedCoins) {
    // Placeholder. This method should be overridden by the extended managers.
  }

  /**
   * Cleans up any resources (e.g. event listeners) used by this manager.
   */
  cleanup() {
    this.currencyTransformerWorker.removeEventListener(
      "message",
      this._handleWorkerMessage,
    );
    this.currencyTransformerWorker.terminate();
  }
}
