import { CurrencyCacheCoordinator } from "./CurrencyCacheCoordinator";
import { setToLocalStorageWithExpiry, isCacheValid } from "./cache.utils";
import { convertCurrency } from "./currency.utils";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import db from "./database";

const COINLISTS_TABLENAME = "coinLists";

/**
 * Manages the caching of coin list data and handles worker responses
 * for currency transformation specific to coin list.
 * @extends CurrencyCacheCoordinator
 */
export class CoinListCacheManager extends CurrencyCacheCoordinator {
  /**
   * @constructor
   * @param {Function} dispatch - The Redux dispatch function.
   * @param {string} initialCurrency - The initial currency for the app.
   * @param {Array} initialRates - The initial exchange rates.
   * @param {Object} coins - Initial coins data.
   * @param {string} currentSymbol - Current currency symbol.
   * @param {string} currentCurrency - Current currency.
   * @param {Object} coinListCoinsByCurrency - An object holding coin data for each currency.
   */
  constructor(
    dispatch,
    initialCurrency,
    initialRates,
    coins,
    currentSymbol,
    currentCurrency,
    coinListCoinsByCurrency,
  ) {
    super(dispatch, initialCurrency, initialRates, COINLISTS_TABLENAME);
    this.coins = coins;
    this.currentSymbol = currentSymbol;
    this.currentCurrency = currentCurrency;
    this.coinListCoinsByCurrency = coinListCoinsByCurrency;
  }

  /**
   * Processes and stores transformed coins.
   * @param {Object} transformedCoins - Transformed coin data.
   */
  async handleTransformedData(transformedCoins) {
    console.log(transformedCoins);
    for (const currency in transformedCoins) {
      // Store transformed coin data in Redux
      this.dispatch(
        coinsActions.setCoinListForCurrency({
          currency,
          coinData: transformedCoins[currency],
        }),
      );

      // Store in IndexedDB
      await this._storeCoinDataInIndexedDB(
        currency,
        transformedCoins[currency],
      ).catch((err) => {
        console.error("Error setting initial CoinListData to IndexedDB", err);
      });
    }

    // Store initial data in Redux
    this.dispatch(
      coinsActions.setCoinListForCurrency({
        currency: this.initialCurrency.toUpperCase(),
        coinData: this.coins.initialHundredCoins,
      }),
    );

    // Store initial data in IndexedDB
    await this._storeCoinDataInIndexedDB(
      this.initialCurrency.toUpperCase(),
      this.coins.initialHundredCoins,
    ).catch((err) => {
      console.error("Error setting initial CoinListData to IndexedDB", err);
    });
  }

  /**
   * Dispatches the initial coin and currency data.
   */
  _dispatchInitialData() {
    // Dispatch initial coin data to Redux
    this.dispatch(
      coinsActions.updateCoins({
        displayedCoinListCoins: this.coins.initialHundredCoins,
        trendingCarouselCoins: this.coins.trendingCoins,
        symbol: this.currentSymbol,
      }),
    );

    // Dispatch initial currency data to Redux
    this.dispatch(
      coinsActions.setCoinListForCurrency({
        currency: this.initialCurrency.toUpperCase(),
        coinData: this.coins.initialHundredCoins,
      }),
    );

    // Dispatch initial rates to Redux
    this.dispatch(
      currencyActions.updateRates({ currencyRates: this.initialRates }),
    );
  }

  /**
   * Attempts to fetch data from the cache and dispatch it.
   * If the cache is not valid or the data isn't available,
   * it sends the data for transformation using a worker,
   * which is then dispatched by the handler to the Redux store
   *
   * @async
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
   * Fetches data from cache and dispatches to the Redux store.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  async _dispatchDataFromCache() {
    const dispatchPromises = [];

    await db.coinLists.each((data) => {
      if (data && data.coins) {
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
   * Initializes the Web Worker for currency transformation.
   * Checks if a worker is already active before initializing.
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
          coins: this.coins.initialHundredCoins,
          rates: this.initialRates,
          currentCurrency: this.initialCurrency.toUpperCase(),
        },
      });
    }
  }

  /**
   * Helper method to store coin data in IndexedDB.
   * @param {string} currency - The currency type.
   * @param {Object} coins - The coin data.
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

  /**
   * Handles on-the-fly currency transformation.
   * @param {Object} coin - Coin data.
   * @param {string} updatedCurrency - New currency to transform to.
   * @param {number} i - Index.
   * @returns {Object} Transformed coin data.
   */
  _transformCurrency(coin, updatedCurrency, i) {
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

  /**
   * Sets a new currency and transforms the coin data accordingly.
   * @param {string} updatedCurrency - The new currency.
   */
  async setNewCurrency(updatedCurrency) {
    let updatedCurrencyCoins;

    if (
      this.coinListCoinsByCurrency[updatedCurrency.toUpperCase()] &&
      this.coinListCoinsByCurrency[updatedCurrency.toUpperCase()].length > 0
    ) {
      console.log("CACHE USED for setNewCurrency");
      updatedCurrencyCoins =
        this.coinListCoinsByCurrency[updatedCurrency.toUpperCase()];
    } else if (this.coins.initialHundredCoins?.length > 0) {
      updatedCurrencyCoins = this.coins.initialHundredCoins
        .map((coin, i) =>
          this._transformCurrency(coin, updatedCurrency.toUpperCase(), i),
        )
        .filter(Boolean);
    }

    const trendingCoins = updatedCurrencyCoins.slice(0, 10);

    // Dispatch the newly computed data to the Redux to be displayed
    this.dispatch(
      coinsActions.updateCoins({
        displayedCoinListCoins: updatedCurrencyCoins,
        trendingCarouselCoins: trendingCoins,
        symbol: this.currentSymbol,
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
}
