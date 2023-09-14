import { CoinCacheManager } from "./CoinCacheManager";
import {
  setToLocalStorageWithExpiry,
  isCacheValid,
  fetchDataFromCache,
} from "./cache.utils";
import { convertCurrency } from "./currency.utils";
import { coinsActions } from "../store/coins";
import { currencyActions } from "../store/currency";
import db from "./database";

/**
 * Manages the caching of coin list data and handles worker responses for currency transformation specific to coin list.
 */
export class CoinListCacheManager extends CoinCacheManager {
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
    super(dispatch, initialCurrency, initialRates);
    this.coins = coins;
    this.currentSymbol = currentSymbol;
    this.currentCurrency = currentCurrency;
    this.coinListCoinsByCurrency = coinListCoinsByCurrency;
    this.currencyTransformerWorker = new Worker(
      "/webWorkers/currencyTransformerWorker.js",
    );

    // Store the bound function to a class property
    this.boundHandleWorkerMessage = this._handleWorkerMessage.bind(this);
  }

  /**
   * Initializes the coin list cache manager, clearing invalid cache, and loading initial coins and currency alternatives.
   */
  init() {
    super.init();

    this._loadInitialCoinsAndCurrencyAlternatives();
  }

  /**
   * Loads initial coins and currency alternatives, handling cache and dispatching necessary actions.
   */
  _loadInitialCoinsAndCurrencyAlternatives() {
    // Use the stored bound function for event listener
    this.currencyTransformerWorker.addEventListener(
      "message",
      this.boundHandleWorkerMessage,
    );

    this.dispatch(
      coinsActions.updateCoins({
        displayedCoinListCoins: this.coins.initialHundredCoins,
        trendingCarouselCoins: this.coins.trendingCoins,
        symbol: this.currentSymbol,
      }),
    );

    this.dispatch(
      coinsActions.setCoinListForCurrency({
        currency: this.initialCurrency.toUpperCase(),
        coinData: this.coins.initialHundredCoins,
      }),
    );

    if (isCacheValid()) {
      const cacheUsedSuccessfully = fetchDataFromCache(this.dispatch);
      if (cacheUsedSuccessfully) {
        return;
      }
    }

    this.currencyTransformerWorker.postMessage({
      type: "transformCoinList",
      data: {
        coins: this.coins.initialHundredCoins,
        rates: this.initialRates,
        currentCurrency: this.initialCurrency.toUpperCase(),
      },
    });

    this.dispatch(
      currencyActions.updateRates({ currencyRates: this.initialRates }),
    );
  }

  /**
   * Handles the messages from the currency transformer worker.
   * @param {Event} e - The message event.
   */
  _handleWorkerMessage(e) {
    const { transformedCoins } = e.data;

    Object.keys(transformedCoins).forEach((currency) => {
      this.dispatch(
        coinsActions.setCoinListForCurrency({
          currency,
          coinData: transformedCoins[currency],
        }),
      );

      // Update IndexedDB
      db.coinLists
        .put({
          currency,
          coins: transformedCoins[currency],
        })
        .then(() => {
          setToLocalStorageWithExpiry(`coinList_${currency}`, "valid");
        })
        .catch((err) => {
          console.error("Error setting CoinListData to IndexedDB", err);
        });
    });

    // Update IndexedDB with the initial data
    db.coinLists
      .put({
        currency: this.initialCurrency.toUpperCase(),
        coins: this.coins.initialHundredCoins,
      })
      .then(() => {
        // Mark this currency as valid in localStorage with expiration
        setToLocalStorageWithExpiry(
          `coinList_${this.initialCurrency.toUpperCase()}`,
          "valid",
        );
      })
      .catch((err) => {
        console.error("Error setting CoinListData to IndexedDB", err);
      });
  }

  /**
   * Handles on-the-fly currency transformation.
   * @param {Object} coin - The coin data.
   * @param {number} i - The index.
   * @returns {Object} - The transformed coin data.
   */
  _transformCurrency(coin, i) {
    return {
      ...coin,
      current_price: convertCurrency(
        coin.current_price,
        this.initialCurrency.toUpperCase(),
        this.currentCurrency.toUpperCase(),
        this.initialRates,
      ),
      market_cap: convertCurrency(
        coin.market_cap,
        this.initialCurrency.toUpperCase(),
        this.currentCurrency.toUpperCase(),
        this.initialRates,
      ),
      market_cap_rank: i + 1,
      total_volume: convertCurrency(
        coin.total_volume,
        this.initialCurrency.toUpperCase(),
        this.currentCurrency.toUpperCase(),
        this.initialRates,
      ),
      high_24h: convertCurrency(
        coin.high_24h,
        this.initialCurrency.toUpperCase(),
        this.currentCurrency.toUpperCase(),
        this.initialRates,
      ),
      low_24h: convertCurrency(
        coin.low_24h,
        this.initialCurrency.toUpperCase(),
        this.currentCurrency.toUpperCase(),
        this.initialRates,
      ),
      price_change_24h: convertCurrency(
        coin.price_change_24h,
        this.initialCurrency.toUpperCase(),
        this.currentCurrency.toUpperCase(),
        this.initialRates,
      ),
    };
  }

  /**
   * Set the new currency and transform the coin data accordingly.
   */
  setNewCurrency() {
    let updatedCurrencyCoins;

    if (
      this.coinListCoinsByCurrency[this.currentCurrency.toUpperCase()] &&
      this.coinListCoinsByCurrency[this.currentCurrency.toUpperCase()].length >
        0
    ) {
      console.log("CACHE USED for setNewCurrency");
      updatedCurrencyCoins =
        this.coinListCoinsByCurrency[this.currentCurrency.toUpperCase()];
    } else if (this.coins.initialHundredCoins?.length > 0) {
      updatedCurrencyCoins = this.coins.initialHundredCoins
        .map(this._transformCurrency.bind(this))
        .filter(Boolean);
    }

    const trendingCoins = updatedCurrencyCoins.slice(0, 10);

    this.dispatch(
      coinsActions.updateCoins({
        displayedCoinListCoins: updatedCurrencyCoins,
        trendingCarouselCoins: trendingCoins,
        symbol: this.currentSymbol,
      }),
    );

    // Save the newly computed data to the cache
    this.dispatch(
      coinsActions.setCoinListForCurrency({
        currency: this.currentCurrency,
        coinData: updatedCurrencyCoins,
      }),
    );

    // Update IndexedDB with the transformed data for current currency
    db.coinLists
      .put({
        currency: this.currentCurrency.toUpperCase(),
        coins: updatedCurrencyCoins,
      })
      .then(() => {
        setToLocalStorageWithExpiry(
          `coinList_${this.currentCurrency.toUpperCase()}`,
          "valid",
        );
      })
      .catch((err) => {
        console.error("Error setting CoinListData to IndexedDB", err);
      });
  }

  /**
   * Cleans up any resources used by this manager.
   */
  cleanup() {
    super.cleanup();
    if (this.currencyTransformerWorker) {
      // Use the stored bound function to remove event listener
      this.currencyTransformerWorker.removeEventListener(
        "message",
        this.boundHandleWorkerMessage,
      );
      this.currencyTransformerWorker.terminate();
    }
  }
}
