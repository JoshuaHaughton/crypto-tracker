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
   * Creates an instance of the CoinCacheManager.
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

    this.currencyTransformerWorker = null; // Initialized later if needed and will be cleaned up by this class
  }

  /**
   * @description Initializes the cache manager. Starts with the initial data dispatch, then manages the cache, and finally retrieves and dispatches the desired data.
   */
  init() {
    try {
      this._dispatchInitialData();
      this._clearInvalidCache();
      this._getAndDispatchDesiredData();
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  }

  /**
   * @private
   * @description Clears cache for any invalid currency values.
   */
  async _clearInvalidCache() {
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

  /**
   * @private
   * @description Placeholder for dispatching initial data fetched from API. Should be overridden by subclasses.
   */
  _dispatchInitialData() {
    // To be implemented by subclasses.
  }

  /**
   * @private
   * @description Placeholder for retrieving and dispatching the desired data. Subclasses should ideally implement this to dispatch data from cache if available, or send data to the transformer worker if not.
   */
  _getAndDispatchDesiredData() {
    // To be implemented by subclasses.
  }

  /**
   * @private
   * @description Placeholder for dispatching data directly from the cache. Should be overridden by subclasses.
   */
  _dispatchDataFromCache() {
    // To be implemented by subclasses.
  }

  /**
   * @description Returns the worker, initializing it if it hasn't been already.
   */
  _initializeTransformerWorker() {
    if (!this.currencyTransformerWorker) {
      // Initialize the worker here when it's first needed
      // this.currencyTransformerWorker = new Worker(...);
    }
    return this.currencyTransformerWorker;
  }

  /**
   * @private
   * @description Placeholder for sending data to the transformer worker for processing. Should be overridden by subclasses.
   */
  _sendToTransformWorker() {
    // To be implemented by subclasses.
  }

  /**
   * @private
   * @description Handles the message event from the currency transformer worker and processes the transformed coins data.
   * @param {Event} e - The message event from the worker.
   */
  _handleWorkerMessage = (e) => {
    try {
      const { transformedCoins } = e.data;
      this.handleTransformedData(transformedCoins);
    } catch (workerError) {
      console.error("Error handling worker message:", workerError);
    }
  };

  /**
   * @description Placeholder for handling transformed data after processing by the worker. Should be overridden by subclasses.
   * @param {Array} transformedCoins - The transformed coin data.
   */
  handleTransformedData(transformedCoins) {
    // To be implemented by subclasses.
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
}
