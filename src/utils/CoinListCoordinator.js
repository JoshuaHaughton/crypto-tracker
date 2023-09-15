import { CacheCoordinator } from "./CacheCoordinator";
import { setToLocalStorageWithExpiry, isCacheValid } from "./cache.utils";
import { convertCurrency } from "./currency.utils";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import {
  COINLISTS_TABLENAME,
  SYMBOLS_BY_CURRENCIES,
} from "../global/constants";
import db from "./database";

/**
 * Manages the caching of coin list data and handles worker responses
 * for currency transformation specific to coin list.
 * @extends CacheCoordinator
 */
export class CoinListCoordinator extends CacheCoordinator {
  /**
   * @constructor
   * @param {Function} dispatch - The Redux dispatch function.
   * @param {string} initialCurrency - The initial currency for the app.
   * @param {Array} initialRates - The initial exchange rates.
   * @param {Object} initialHundredCoins - Initial coins data.
   * @param {Object} initialTrendingCoins - Initial trending coins data.
   */
  constructor(
    dispatch,
    initialCurrency,
    initialRates,
    initialHundredCoins,
    initialTrendingCoins,
  ) {
    super(dispatch, initialCurrency, initialRates, COINLISTS_TABLENAME);
    this.initialHundredCoins = initialHundredCoins;
    this.initialTrendingCoins = initialTrendingCoins;
  }

  // Public Methods

  /**
   * @public
   * @async
   * @param {Object} coinListCoinsByCurrency - The object holding coin data for each currency.
   * @param {string} updatedCurrency - The new currency.
   * @param {string} currentSymbol - The current currency symbol.
   * @description Sets a new currency and transforms the coin data accordingly. Dispatches the updated coin data and saves to IndexedDB cache if necessary.
   * @returns {Promise<void>} Resolves once the new currency has been set and any necessary transformations have been performed.
   */
  async setNewCurrency(
    coinListCoinsByCurrency,
    updatedCurrency,
    currentSymbol,
  ) {
    let updatedCurrencyCoins;

    if (
      coinListCoinsByCurrency[updatedCurrency.toUpperCase()] &&
      coinListCoinsByCurrency[updatedCurrency.toUpperCase()].length > 0
    ) {
      console.log("CACHE USED for setNewCurrency");
      updatedCurrencyCoins =
        coinListCoinsByCurrency[updatedCurrency.toUpperCase()];
    } else if (this.initialHundredCoins?.length > 0) {
      console.log(
        "CACHE, NOT used. existing cache:",
        this.coinListCoinsByCurrency,
      );
      updatedCurrencyCoins = this.initialHundredCoins
        .map((coin, i) =>
          this.#transformCurrency(coin, updatedCurrency.toUpperCase(), i),
        )
        .filter(Boolean);
    }

    const trendingCoins = updatedCurrencyCoins.slice(0, 10);

    // Dispatch the newly computed data to the Redux to be displayed
    this.dispatch(
      coinsActions.updateCoins({
        displayedCoinListCoins: updatedCurrencyCoins,
        trendingCarouselCoins: trendingCoins,
        symbol: currentSymbol,
      }),
    );

    // Save the newly computed data to the Redux cache
    this.dispatch(
      coinsActions.setCoinListForCurrency({
        currency: updatedCurrency.toUpperCase(),
        coinData: updatedCurrencyCoins,
      }),
    );

    // Save to IndexedDB cache
    // Check if data exists in IndexedDB before saving
    const existingData = await db.coinLists.get(updatedCurrency.toUpperCase());

    if (!existingData) {
      try {
        await db.coinLists.put({
          currency: updatedCurrency.toUpperCase(),
          coins: updatedCurrencyCoins,
        });
        setToLocalStorageWithExpiry(
          COINLISTS_TABLENAME,
          updatedCurrency.toUpperCase(),
        );
      } catch (err) {
        console.error("Error setting CoinListData to IndexedDB", err);
      }
    }
  }

  // Protected Methods

  /**
   * @protected
   * @async
   * @param {Object} transformedCoins - The transformed coin data.
   * @description Processes and stores transformed coins in Redux and IndexedDB.
   */
  async _handleTransformedData(transformedCoins) {
    const storagePromises = [];

    for (const currency in transformedCoins) {
      // Store transformed coin data in Redux
      this.dispatch(
        coinsActions.setCoinListForCurrency({
          currency,
          coinData: transformedCoins[currency],
        }),
      );

      // Queue up IndexedDB storage promises
      storagePromises.push(
        this._storeCoinDataInIndexedDB(currency, transformedCoins[currency]),
      );
    }

    // Store initial data in Redux
    this.dispatch(
      coinsActions.setCoinListForCurrency({
        currency: this.initialCurrency.toUpperCase(),
        coinData: this.initialHundredCoins,
      }),
    );

    // Add the initial data storage to the promises
    storagePromises.push(
      this._storeCoinDataInIndexedDB(
        this.initialCurrency.toUpperCase(),
        this.initialHundredCoins,
      ),
    );

    // Wait for all storage operations to complete
    await Promise.all(storagePromises).catch((err) => {
      console.error("Error during IndexedDB storage:", err);
    });
  }

  /**
   * @protected
   * @description
   * Dispatches the initial coin and currency data to the Redux store.
   * Note: The dispatched data is used to populate the Redux store for initial render or when the cache is invalid.
   *
   * @returns {void}
   */
  _dispatchInitialData() {
    // Dispatch initial coin data to Redux
    this.dispatch(
      coinsActions.updateCoins({
        displayedCoinListCoins: this.initialHundredCoins,
        trendingCarouselCoins: this.trendingCoins,
        symbol: SYMBOLS_BY_CURRENCIES[this.initialCurrency],
      }),
    );

    // Dispatch initial currency data to Redux
    this.dispatch(
      coinsActions.setCoinListForCurrency({
        currency: this.initialCurrency.toUpperCase(),
        coinData: this.initialHundredCoins,
      }),
    );

    // Dispatch initial rates to Redux
    this.dispatch(
      currencyActions.updateRates({ currencyRates: this.initialRates }),
    );
  }

  /**
   *
   * @protected
   * @async
   * @description
   * Attempts to fetch data from the cache and dispatch it.
   * If the cache is not valid or the data isn't available,
   * it sends the data for transformation using a worker,
   * which is then dispatched by the handler to the Redux store
   * @returns {Promise<void>} A promise that resolves once the data is dispatched or sent for transformation.
   */
  async _getAndDispatchDesiredData() {
    if (isCacheValid(COINLISTS_TABLENAME)) {
      const cacheUsedSuccessfully = await this._dispatchDataFromCache();
      if (cacheUsedSuccessfully) return;
    }

    // If cache is not valid or data is not available, transform the data using a worker
    this._sendToTransformWorker();
  }

  /**
   * @protected
   * @async
   * @description Fetches data from cache and dispatches to the Redux store.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  async _dispatchDataFromCache() {
    const dispatchPromises = [];

    await db.coinLists.each((data) => {
      // We don't dispatch the initialCurrency here because it was already disaptched in this._dispatchInitialData
      if (data?.coins && data.currency !== this.initialCurrency) {
        // Store each dispatch action in the dispatchPromises array
        dispatchPromises.push(
          this.dispatch(
            coinsActions.setCoinListForCurrency({
              currency: data.currency,
              coinData: data.coins,
            }),
          ),
        );
      }
    });

    try {
      // Use Promise.all() to ensure all dispatch actions execute successfully
      await Promise.all(dispatchPromises);
      return true;
    } catch (err) {
      console.error("Error fetching data from IndexedDB:", err);
      return false;
    }
  }

  /**
   * @protected
   * @description
   * Initializes and sends data to a Web Worker for the purpose of currency transformation.
   * Transformed data is then picked up by this._handleTransformedData, disaptced to the Redux store, and cached in IndexedDB.
   */
  _sendToTransformWorker() {
    if (typeof window !== "undefined" && !this.currencyTransformerWorker) {
      this.currencyTransformerWorker = new Worker(
        "/webWorkers/currencyTransformerWorker.js",
      );
      this.currencyTransformerWorker.addEventListener(
        "message",
        this._handleWorkerMessage,
      );

      // Post data to the worker for processing
      this.currencyTransformerWorker.postMessage({
        type: "transformCoinList",
        data: {
          coins: this.initialHundredCoins,
          rates: this.initialRates,
          currentCurrency: this.initialCurrency.toUpperCase(),
        },
      });
    }
  }

  /**
   * @protected
   * @async
   * @param {string} currency - The currency type.
   * @param {Object} coins - The coin data.
   * @description Helper method to store coin data in IndexedDB.
   */
  async _storeCoinDataInIndexedDB(currency, coins) {
    try {
      await db.coinLists.put({
        currency,
        coins: coins,
      });
      setToLocalStorageWithExpiry(COINLISTS_TABLENAME, currency.toUpperCase());
    } catch (err) {
      console.error(`Error setting ${currency} CoinListData to IndexedDB`, err);
    }
  }

  // Private

  /**
   * @private
   * @param {Object} coin - Coin data.
   * @param {string} updatedCurrency - New currency to transform to.
   * @param {number} i - Index.
   * @description Handles on-the-fly currency transformation.
   * @returns {Object} Transformed coin data.
   */
  #transformCurrency(coin, updatedCurrency, i) {
    return {
      ...coin,
      current_price: convertCurrency(
        coin.current_price,
        this.initialCurrency.toUpperCase(),
        updatedCurrency,
        this.initialRates,
      ),
      market_cap: convertCurrency(
        coin.market_cap,
        this.initialCurrency.toUpperCase(),
        updatedCurrency,
        this.initialRates,
      ),
      market_cap_rank: i + 1,
      total_volume: convertCurrency(
        coin.total_volume,
        this.initialCurrency.toUpperCase(),
        updatedCurrency,
        this.initialRates,
      ),
      high_24h: convertCurrency(
        coin.high_24h,
        this.initialCurrency.toUpperCase(),
        updatedCurrency,
        this.initialRates,
      ),
      low_24h: convertCurrency(
        coin.low_24h,
        this.initialCurrency.toUpperCase(),
        updatedCurrency,
        this.initialRates,
      ),
      price_change_24h: convertCurrency(
        coin.price_change_24h,
        this.initialCurrency.toUpperCase(),
        updatedCurrency,
        this.initialRates,
      ),
    };
  }
}
