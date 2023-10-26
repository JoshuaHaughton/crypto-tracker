const TRANSFORM_COIN_DETAILS_CURRENCY = "transformCoinDetailsCurrency";
const TRANSFORM_ALL_COIN_DETAILS_CURRENCIES =
  "transformAllCoinDetailsCurrencies";
const TRANSFORM_POPULAR_COINS_LIST_CURRENCY =
  "transformPopularCoinsListCurrency";
const TRANSFORM_ALL_POPULAR_COINS_LIST_CURRENCIES =
  "transformAllPopularCoinsListCurrencies";
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
const transformCurrencyForPopularCoinsList = (
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
 * Converts the currency for chart data.
 *
 * @param {Object} chartData - The original chart data.
 * @param {string} fromCurrency - The source currency code.
 * @param {string} toCurrency - The target currency code.
 * @param {Object} currencyRates - The conversion rates.
 * @returns {Object} The chart data with transformed currency values.
 */
const convertChartData = (
  chartData,
  fromCurrency,
  toCurrency,
  currencyRates,
) => ({
  ...chartData,
  datasets: chartData.datasets.map((dataset) => ({
    ...dataset,
    label: `${dataset.label.split(" ").slice(0, -1).join(" ")} ${toCurrency}`,
    data: dataset.data.map((value) =>
      convertCurrency(value, fromCurrency, toCurrency, currencyRates),
    ),
  })),
});

/**
 * Converts the currency for market chart data.
 *
 * @param {Object} marketChart - The original market chart data.
 * @param {string} fromCurrency - The source currency code.
 * @param {string} toCurrency - The target currency code.
 * @param {Object} currencyRates - The conversion rates.
 * @returns {Object} The market chart data with transformed currency values.
 */
const convertMarketChart = (
  marketChart,
  fromCurrency,
  toCurrency,
  currencyRates,
) => ({
  ...marketChart,
  day: marketChart.day.map((dataPoint) => [
    dataPoint[0],
    convertCurrency(dataPoint[1], fromCurrency, toCurrency, currencyRates),
  ]),
  week: marketChart.week.map((dataPoint) => [
    dataPoint[0],
    convertCurrency(dataPoint[1], fromCurrency, toCurrency, currencyRates),
  ]),
  month: marketChart.month.map((dataPoint) => [
    dataPoint[0],
    convertCurrency(dataPoint[1], fromCurrency, toCurrency, currencyRates),
  ]),
  year: marketChart.year.map((dataPoint) => [
    dataPoint[0],
    convertCurrency(dataPoint[1], fromCurrency, toCurrency, currencyRates),
  ]),
});

/**
 * Converts the currency for market values.
 *
 * @param {Object} marketValues - The original market values.
 * @param {string} fromCurrency - The source currency code.
 * @param {string} toCurrency - The target currency code.
 * @param {Object} currencyRates - The conversion rates.
 * @returns {Object} The market values with transformed currency values.
 */
const convertMarketValues = (
  marketValues,
  fromCurrency,
  toCurrency,
  currencyRates,
) => ({
  ...marketValues,
  dayMarketValues: marketValues.dayMarketValues.map((value) =>
    convertCurrency(value, fromCurrency, toCurrency, currencyRates),
  ),
  weekMarketValues: marketValues.weekMarketValues.map((value) =>
    convertCurrency(value, fromCurrency, toCurrency, currencyRates),
  ),
  monthMarketValues: marketValues.monthMarketValues.map((value) =>
    convertCurrency(value, fromCurrency, toCurrency, currencyRates),
  ),
  yearMarketValues: marketValues.yearMarketValues.map((value) =>
    convertCurrency(value, fromCurrency, toCurrency, currencyRates),
  ),
});

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
  coinAttributes: {
    ...coinToTransform.coinAttributes,
    current_price: convertCurrency(
      coinToTransform.coinAttributes.current_price,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    market_cap: convertCurrency(
      coinToTransform.coinAttributes.market_cap,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    price_change_1d: convertCurrency(
      coinToTransform.coinAttributes.price_change_1d,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    price_change_7d: convertCurrency(
      coinToTransform.coinAttributes.price_change_7d,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    price_change_30d: convertCurrency(
      coinToTransform.coinAttributes.price_change_30d,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
    price_change_365d: convertCurrency(
      coinToTransform.coinAttributes.price_change_365d,
      fromCurrency,
      toCurrency,
      currencyRates,
    ),
  },
  marketChartValues: convertMarketChart(
    coinToTransform.marketChartValues,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
  marketValues: convertMarketValues(
    coinToTransform.marketValues,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
  chartValues: convertChartData(
    coinToTransform.chartValues,
    fromCurrency,
    toCurrency,
    currencyRates,
  ),
});

/**
 * Web Worker event listener for message events related to currency transformation tasks.
 *
 * This Web Worker is responsible for performing currency conversions on various datasets.
 * It operates off the main thread to ensure that currency conversions, which can be
 * computationally intensive, do not block the main thread and cause UI issues.
 *
 * The worker expects messages with a specific structure and responds with the appropriate
 * transformed data. This is part of the Currency Transformer lifecycle, where:
 * 1. The main thread sends a message to the worker with data to be transformed.
 * 2. The worker receives the message, performs the transformation, and posts the result back.
 * 3. The main thread then processes the transformed result accordingly.
 *
 * Note: This file shouldn't have any imports because Web Workers in many environments
 * have restrictions on using ES modules. All necessary functions or variables should
 * be defined within the worker or passed in the message data.
 *
 * @listens message
 * @param {MessageEvent} event - The message event containing data for transformation.
 */
self.addEventListener(
  "message",
  (event) => {
    const { type, data } = event.data;

    switch (type) {
      case TRANSFORM_COIN_DETAILS_CURRENCY:
        const transformedCoinDetails = transformCurrencyForCoinDetails(
          data.coinToTransform,
          data.fromCurrency,
          data.toCurrency,
          data.currencyRates,
        );
        self.postMessage({
          type,
          transformedData: transformedCoinDetails,
          toCurrency: data.toCurrency,
        });
        break;

      case TRANSFORM_ALL_COIN_DETAILS_CURRENCIES:
        // Extract the necessary data for the transformation
        const {
          coinToTransform,
          fromCurrency: coinFromCurrency,
          currencyRates: coinCurrencyRates,
          currenciesToExclude: coinCurrenciesToExclude,
        } = data;

        let coinTargetCurrencies = ALL_CURRENCIES;

        if (coinCurrenciesToExclude?.length > 0) {
          // Filter out the excluded currency from the list of all currencies if it exists
          coinTargetCurrencies = coinTargetCurrencies.filter(
            (currency) => !coinCurrenciesToExclude.includes(currency),
          );
        }

        // Create an object to store the transformed data for each target currency
        const coinDetailsTransformedData = {};

        coinTargetCurrencies.forEach((targetCurrency) => {
          coinDetailsTransformedData[targetCurrency] =
            transformCurrencyForCoinDetails(
              coinToTransform,
              coinFromCurrency,
              targetCurrency,
              coinCurrencyRates,
            );
        });

        self.postMessage({
          type,
          transformedData: coinDetailsTransformedData,
        });
        break;

      case TRANSFORM_POPULAR_COINS_LIST_CURRENCY:
        const transformedPopularCoinsList =
          transformCurrencyForPopularCoinsList(
            data.coinsToTransform,
            data.fromCurrency,
            data.toCurrency,
            data.currencyRates,
          );
        self.postMessage({
          type,
          transformedData: transformedPopularCoinsList,
          toCurrency: data.toCurrency,
        });
        break;

      case TRANSFORM_ALL_POPULAR_COINS_LIST_CURRENCIES:
        // Extract the necessary data for the transformation
        const {
          coinsToTransform,
          fromCurrency,
          currenciesToExclude,
          currencyRates,
        } = data;

        let targetCurrencies = ALL_CURRENCIES;

        if (currenciesToExclude?.length > 0) {
          // Filter out the excluded currencies from the list of all currencies if it exists
          targetCurrencies = targetCurrencies.filter(
            (currency) => !currenciesToExclude.includes(currency),
          );
        }

        // Create an object to store the transformed data for each target currency
        const popularCoinsListTransformedData = {};

        targetCurrencies.forEach((targetCurrency) => {
          popularCoinsListTransformedData[targetCurrency] =
            transformCurrencyForPopularCoinsList(
              coinsToTransform,
              fromCurrency,
              targetCurrency,
              currencyRates,
            );
        });

        self.postMessage({
          type,
          transformedData: popularCoinsListTransformedData,
        });
        break;

      default:
        // Handle any unexpected message types
        console.warn(`Unexpected message type received: ${type}`);
    }
  },
  false,
);
