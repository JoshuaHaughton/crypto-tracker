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
    this.currencyTransformerWorker = null;
  }

  /**
   * Initializes the cache manager. Clears invalid cache, initializes the currency transformer worker,
   * and loads initial coins and currency alternatives.
   */
  init() {
    this._clearInvalidCache();
    this._initializeCurrencyTransformerWorker();
    this._loadInitialCoinsAndCurrencyAlternatives();
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
   * @private
   * Initializes the currency transformer web worker and sets up an event listener for it.
   */
  _initializeCurrencyTransformerWorker() {
    // Check that we're in the browser for Nextjs
    if (typeof window !== "undefined") {
      this.currencyTransformerWorker = new Worker(
        "/webWorkers/currencyTransformerWorker.js",
      );
      this.currencyTransformerWorker.addEventListener(
        "message",
        this._handleWorkerMessage,
      );
    }
  }

  /**
   * Placeholder logic for loading initial coins and currency alternatives. Should be overridden by subclasses.
   */
  _loadInitialCoinsAndCurrencyAlternatives() {
    // This should be overridden by subclasses.
  }

  /**
   * @private
   * Handles the message event from the currency transformer worker.
   * @param {Event} e - The message event.
   */
  _handleWorkerMessage = (e) => {
    const { transformedCoins } = e.data;
    this.handleTransformedCoins(transformedCoins);
  };

  /**
   * Placeholder to handle transformed coins data. Should be overridden by extended managers.
   * @param {Array} transformedCoins - The transformed coin data.
   */
  handleTransformedCoins(transformedCoins) {
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
