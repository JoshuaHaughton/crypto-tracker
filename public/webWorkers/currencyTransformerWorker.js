const SYMBOLS_BY_CURRENCIES = {
  CAD: "$",
  USD: "$",
  GBP: "£",
  AUD: "AU$",
};

const ALL_CURRENCIES = ["CAD", "USD", "AUD", "GBP"];

/**
 * Converts a value from one currency to another using the given currency rates.
 *
 * @param {number} value The amount to be converted.
 * @param {string} fromCurrency The source currency code.
 * @param {string} toCurrency The target currency code.
 * @param {Object} currencyRates The conversion rates.
 * @returns {number} The converted amount.
 */
const convertCurrency = (value, fromCurrency, toCurrency, currencyRates) => {
  return value * currencyRates[fromCurrency][toCurrency];
};

/**
 * Transforms the currency data for a list of coins.
 *
 * @param {Array} coinsToTransform The list of coins to transform.
 * @param {string} fromCurrency The source currency code.
 * @param {string} toCurrency The target currency code.
 * @param {Object} currencyRates The conversion rates.
 * @returns {Array} The list of coins with transformed currency data.
 */
const transformCurrencyForCoinList = (
  coinsToTransform,
  fromCurrency,
  toCurrency,
  currencyRates,
) => {
  return coinsToTransform.map((coin, index) => ({
    ...coin,
    current_price: convertCurrency(
      coin.current_price,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    market_cap: convertCurrency(
      coin.market_cap,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    market_cap_rank: index + 1,
    total_volume: convertCurrency(
      coin.total_volume,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    high_24h: convertCurrency(
      coin.high_24h,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    low_24h: convertCurrency(
      coin.low_24h,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    price_change_24h: convertCurrency(
      coin.price_change_24h,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
  }));
};

/**
 * Transforms the currency data for a single coin's detailed data.
 *
 * @param {Object} coinToTransform The coin's data to transform.
 * @param {string} fromCurrency The source currency code.
 * @param {string} toCurrency The target currency code.
 * @param {Object} currencyRates The conversion rates.
 * @returns {Object} The coin's data with transformed currency values.
 */
const transformCurrencyForCoinDetails = (
  coinToTransform,
  fromCurrency,
  toCurrency,
  currencyRates,
) => ({
  ...coinToTransform,
  current_price: convertCurrency(
    coinToTransform.current_price,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
  all_time_high: convertCurrency(
    coinToTransform.all_time_high,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
  market_cap: convertCurrency(
    coinToTransform.market_cap,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
  price_change_1d: convertCurrency(
    coinToTransform.price_change_1d,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
  price_change_7d: convertCurrency(
    coinToTransform.price_change_7d,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
  price_change_30d: convertCurrency(
    coinToTransform.price_change_30d,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
  price_change_365d: convertCurrency(
    coinToTransform.price_change_365d,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
});

// Web Worker event listener for message events
self.addEventListener(
  "message",
  (event) => {
    const { type, data } = event.data;
    console.log("finally", type);

    switch (type) {
      case "transformCoinListCurrency":
        const transformedCoinList = transformCurrencyForCoinList(
          data.coinsToTransform,
          data.fromCurrency,
          data.toCurrency,
          data.currencyRates,
        );

        self.postMessage({
          transformedData: transformedCoinList,
          type,
          displaySymbol: SYMBOLS_BY_CURRENCIES[data.toCurrency],
          toCurrency: data.toCurrency,
        });
        break;

      case "transformCoinDetailsCurrency":
        const transformedCoinDetails = transformCurrencyForCoinDetails(
          data.coinToTransform,
          data.fromCurrency,
          data.toCurrency,
          data.currencyRates,
        );
        self.postMessage({
          transformedData: transformedCoinDetails,
          type,
          displaySymbol: SYMBOLS_BY_CURRENCIES[data.toCurrency],
          toCurrency: data.toCurrency,
        });
        break;

      default:
        // Handle any unexpected message types
        console.warn(`Unexpected message type received: ${type}`);
    }
  },
  false,
);
