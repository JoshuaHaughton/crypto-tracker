import { clearCache, isCacheValid } from "./cache.utils";

/**
 * @class CoinCacheManager
 * Base manager for caching operations related to coins and handling worker responses for currency transformation.
 */
export class CoinCacheManager {
  /**
   * @constructor
   * @param {Function} dispatch - The Redux dispatch function.
   * @param {string} initialCurrency - The initial currency for the app.
   * @param {Array} initialRates - The initial exchange rates.
   * @param {string} tableName - The name of the table to be used.
   */
  constructor(dispatch, initialCurrency, initialRates, tableName) {
    this.dispatch = dispatch;
    this.initialCurrency = initialCurrency;
    this.initialRates = initialRates;
    this.tableName = tableName;

    // Will be cleaned up by this class if used
    this.currencyTransformerWorker = null;
  }

  /**
   * Initializes the cache manager. Clears invalid cache, initializes the currency transformer worker,
   * and loads initial coins and currency alternatives.
   */
  init() {
    this._dispatchInitialData();
    this._clearInvalidCache();
    this._getAndDispatchDesiredData();
  }

  /**
   * @private
   * Clears cache for any invalid currency values.
   */
  _clearInvalidCache() {
    const currencies = ["USD", "CAD", "AUD", "GBP"];
    currencies.forEach((currency) => {
      if (!isCacheValid(this.tableName, currency)) {
        clearCache(this.tableName, currency);
      }
    });
  }

  /**
   * Placeholder logic for loading initial data returned by API. Should be overridden by subclasses.
   */
  _dispatchInitialData() {
    // This should be overridden by subclasses.
  }

  /**
   * Placeholder logic for loading initial coins and currency alternatives. Should be overridden by subclasses.
   */
  _getAndDispatchDesiredData() {
    // This should be overridden by subclasses. Should ideally call this._dispatchDataFromCache
    // if the cache is available, and _sendToTransformWorker if not.
  }

  _dispatchDataFromCache() {
    // This should be overridden by subclasses.
  }

  _sendToTransformWorker() {
    // This should be overridden by subclasses.
  }

  /**
   * @private
   * Handles the message event from the currency transformer worker.
   * @param {Event} e - The message event.
   */
  _handleWorkerMessage = (e) => {
    const { transformedCoins } = e.data;
    this.handleTransformedData(transformedCoins);
  };

  /**
   * Placeholder to handle transformed coins data. Should be overridden by extended managers.
   * @param {Array} transformedCoins - The transformed coin data.
   */
  handleTransformedData(transformedCoins) {
    // This should be overridden by subclasses.
  }

  /**
   * Cleans up any resources (e.g. event listeners) used by this manager.
   */
  cleanup() {
    if (this.currencyTransformerWorker) {
      this.currencyTransformerWorker.removeEventListener(
        "message",
        this._handleWorkerMessage,
      );
      this.currencyTransformerWorker.terminate();
    }
  }
}
