import { CurrencyCacheCoordinator } from "./CurrencyCacheCoordinator";
import { setToLocalStorageWithExpiry, isCacheValid } from "./cache.utils";
import { convertCurrency } from "./currency.utils";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import db from "./database";

const COINLISTS_TABLENAME = "coinLists";

/**
 * Manages the caching of coin list data and handles worker responses for currency transformation specific to coin list.
 */
export class CoinListCacheManager extends CurrencyCacheCoordinator {
  /**
   * Creates an instance of the CoinListCacheManager.
   * @param {Function} dispatch - The Redux dispatch function.
   * @param {string} initialCurrency - The initial currency for the app.
   * @param {Array} initialRates - The initial exchange rates.
   * @param {Object} coins - Initial coins data.
   * @param {string} currentSymbol - Current currency symbol.
   * @param {string} currentCurrency - Current currency.
   * @param {Object} coinListCoinsByCurrency - An object holding coin data for each currency, fetched from the Redux store or another suitable source.
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
   * Overrides the base method to handle transformed coins specific to the coin list.
   * @param {Object} transformedCoins - The transformed coin data.
   */
  handleTransformedData(transformedCoins) {
    // Set transformed coins from WebWorker to Redux Store for use throughout app
    Object.keys(transformedCoins).forEach((currency) => {
      this.dispatch(
        coinsActions.setCoinListForCurrency({
          currency,
          coinData: transformedCoins[currency],
        }),
      );

      // Update IndexedDB cache
      db.coinLists
        .put({
          currency,
          coins: transformedCoins[currency],
        })
        .then(() => {
          // Mark this currency as valid in localStorage with expiration
          setToLocalStorageWithExpiry(
            COINLISTS_TABLENAME,
            currency.toUpperCase(),
          );
        })
        .catch((err) => {
          console.error("Error setting CoinListsData to IndexedDB", err);
        });
    });

    // Update IndexedDB cache with the initial data
    db.coinLists
      .put({
        currency: this.initialCurrency.toUpperCase(),
        coins: this.coins.initialHundredCoins,
      })
      .then(() => {
        setToLocalStorageWithExpiry(
          COINLISTS_TABLENAME,
          this.initialCurrency.toUpperCase(),
        );
      })
      .catch((err) => {
        console.error("Error setting CoinListData to IndexedDB", err);
      });
  }

  /**
   * Loads initial coins and currency alternatives, handling cache and dispatching necessary actions.
   */
  _dispatchInitialData() {
    // Dispatch Initial coins from API to Redux
    this.dispatch(
      coinsActions.updateCoins({
        displayedCoinListCoins: this.coins.initialHundredCoins,
        trendingCarouselCoins: this.coins.trendingCoins,
        symbol: this.currentSymbol,
      }),
    );

    // Dispatch Initial currency from API Redux
    this.dispatch(
      coinsActions.setCoinListForCurrency({
        currency: this.initialCurrency.toUpperCase(),
        coinData: this.coins.initialHundredCoins,
      }),
    );

    // Dispatch rates for each currency mapped to eachother based off of initially fetched rates
    this.dispatch(
      currencyActions.updateRates({ currencyRates: this.initialRates }),
    );
  }

  async _getAndDispatchDesiredData() {
    // If we have the values cached, use them. If not, transform the currencies on a separate thread
    if (isCacheValid(COINLISTS_TABLENAME)) {
      const cacheUsedSuccessfully = await this._dispatchDataFromCache(
        this.dispatch,
      );
      if (cacheUsedSuccessfully) return;
    }

    // If not, transform the currencies on a separate thread.
    // this.handleTransformedData will then pick up on the webworker resonse, dispatch to redux, & update the cache
    this._sendToTransformWorker();
  }

  _dispatchDataFromCache() {
    return db.coinLists
      .each((data) => {
        if (data != null && data.coins) {
          // Dispatching the fetched coin data to Redux store
          this.dispatch(
            coinsActions.setCoinListForCurrency({
              currency: data.currency,
              coinData: data.coins,
            }),
          );
        }
      })
      .then(() => true) // Successful fetching of data
      .catch((err) => {
        console.error("Error fetching data from IndexedDB:", err);
      });
  }

  _sendToTransformWorker() {
    // Check that we're in the browser for Nextjs
    if (typeof window !== "undefined") {
      this.currencyTransformerWorker = new Worker(
        "/webWorkers/currencyTransformerWorker.js",
      );
      this.currencyTransformerWorker.addEventListener(
        "message",
        this._handleWorkerMessage,
      );

      // this.handleTransformedData will then pick up on the webworker resonse, dispatch to redux, & update the cache
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
   * Handles on-the-fly currency transformation.
   * @param {Object} coin - The coin data.
   * @param {number} i - The index.
   * @returns {Object} - The transformed coin data.
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
   * Set the new currency and transform the coin data accordingly.
   */
  setNewCurrency(updatedCurrency) {
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

    // Update IndexedDB with the transformed data for current currency
    db.coinLists
      .put({
        currency: updatedCurrency.toUpperCase(),
        coins: updatedCurrencyCoins,
      })
      .then(() => {
        setToLocalStorageWithExpiry(
          COINLISTS_TABLENAME,
          updatedCurrency.toUpperCase(),
        );
      })
      .catch((err) => {
        console.error("Error setting CoinListData to IndexedDB", err);
      });
  }
}
