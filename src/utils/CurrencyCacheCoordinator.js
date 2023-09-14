import { ALL_CURRENCIES } from "../global/constants";
import { clearCache, isCacheValid } from "./cache.utils";

/**
 * @class CurrencyCacheCoordinator
 * @description Orchestrates the caching, transformation, and dispatching of coin-related data.
 * This class coordinates interactions between caching mechanisms, data transformation workers,
 * and state management dispatch functions.
 */
export class CurrencyCacheCoordinator {
  /**
   * Creates an instance of the CurrencyCacheCoordinator.
   * @param {Function} dispatch - The Redux dispatch function.
   * @param {string} initialCurrency - The initial currency for the app.
   * @param {Array} initialRates - The initial exchange rates.
   * @param {string} tableName - The name of the table for cache operations.
   */
  constructor(dispatch, initialCurrency, initialRates, tableName) {
    this.dispatch = dispatch;
    this.initialCurrency = initialCurrency;
    this.initialRates = initialRates;
    this.tableName = tableName;
    this.currencyTransformerWorker = null;
  }

  // Lifecycle methods

  /**
   * @description Initializes the cache coordinator. Starts with the initial data dispatch, then manages the cache, and finally retrieves and dispatches the desired data.
   */
  init() {
    try {
      this._dispatchInitialData();
      this.#clearInvalidCache();
      this._getAndDispatchDesiredData();
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  /**
   * @description Cleans up any resources (like event listeners) used by this manager to prevent memory leaks.
   */
  cleanup() {
    if (this.currencyTransformerWorker) {
      try {
        this.currencyTransformerWorker.removeEventListener(
          "message",
          this._handleWorkerMessage,
        );
        this.currencyTransformerWorker.terminate();
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
    }
  }

  // Public methods

  /**
   * @async
   * @param {Array} transformedData - The transformed data.
   * @description Asynchronous method for dispatching/caching transformed data after processing by the worker. Should be overridden by subclasses to handle the results.
   * @returns {Promise<void>} Resolves when the handling is complete.
   */
  async handleTransformedData(transformedData) {
    // To be implemented by subclasses.
  }

  // Protected Methods

  /**
   * @protected
   * @description Placeholder method for dispatching initial data fetched from API. Should be overridden by subclasses.
   */
  _dispatchInitialData() {
    // To be implemented by subclasses.
  }

  /**
   * @protected
   * @description Placeholder method for retrieving and dispatching the desired data. Subclasses should ideally implement this to dispatch data from cache if available, or send data to the transformer worker if not.
   */
  _getAndDispatchDesiredData() {
    // To be implemented by subclasses.
  }

  /**
   * @protected
   * @description Placeholder method for sending data to the transformer worker for processing. Should be overridden by subclasses.
   */
  _sendToTransformWorker() {
    // To be implemented by subclasses.
  }

  /**
   * @protected
   * @description Handles the message event from the currency transformer worker and processes the transformed coins data.
   * @param {Event} e - The message event from the worker.
   */
  _handleWorkerMessage = async (e) => {
    try {
      const { transformedCoins } = e.data;
      this.handleTransformedData(transformedCoins);
    } catch (workerError) {
      console.error("Error handling worker message:", workerError);
    }
  };

  // Private Methods

  /**
   * @private
   * @description Clears cache for any invalid currency values.
   */
  async #clearInvalidCache() {
    const clearCachePromises = ALL_CURRENCIES.map(async (currency) => {
      if (!isCacheValid(this.tableName, currency)) {
        try {
          await clearCache(this.tableName, currency);
        } catch (cacheError) {
          this.logError(
            `Error clearing cache for currency ${currency}:`,
            cacheError,
          );
        }
      }
    });

    // Await all cache clear operations to complete
    await Promise.all(clearCachePromises);
  }
}
