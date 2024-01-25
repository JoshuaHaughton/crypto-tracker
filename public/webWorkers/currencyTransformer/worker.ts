const ALL_CURRENCIES = ["CAD", "USD", "AUD", "GBP"];

/**
 * Converts a value from one currency to another using the given currency rates.
 *
 * @param {number} value The amount to be converted.
 * @param {TCurrencyString} fromCurrency The source currency code.
 * @param {TCurrencyString} toCurrency The target currency code.
 * @param {TCurrencyExchangeRates} currencyExchangeRates The conversion rates.
 * @returns {number} The converted amount.
 */
const convertCurrency = (
  value: number,
  fromCurrency: TCurrencyString,
  toCurrency: TCurrencyString,
  currencyExchangeRates: TCurrencyExchangeRates,
) => {
  return value * currencyExchangeRates[fromCurrency][toCurrency];
};

/**
 * Transforms the currency data for a list of coins.
 *
 * @param {ICoinOverview[]} coinsToTransform The list of coins to transform.
 * @param {TCurrencyString} fromCurrency The source currency code.
 * @param {TCurrencyString} toCurrency The target currency code.
 * @param {TCurrencyExchangeRates} currencyExchangeRates The conversion rates.
 * @returns {ICoinOverview[]} The list of coins with transformed currency data.
 */
const transformCurrencyForPopularCoinsList = (
  coinsToTransform: ICoinOverview[],
  fromCurrency: TCurrencyString,
  toCurrency: TCurrencyString,
  currencyExchangeRates: TCurrencyExchangeRates,
): ICoinOverview[] => {
  return coinsToTransform.map((coin) => ({
    ...coin,
    current_price: convertCurrency(
      coin.current_price,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
    market_cap: convertCurrency(
      coin.total_market_cap,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
    total_volume: convertCurrency(
      coin.volume_24h,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
    price_change_24h: convertCurrency(
      coin.price_change_percentage_24h,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
  }));
};

/**
 * Converts the currency for chart data.
 *
 * @param {IPriceChartDataset} chartData - The original chart data.
 * @param {TCurrencyString} fromCurrency - The source currency code.
 * @param {TCurrencyString} toCurrency - The target currency code.
 * @param {TCurrencyExchangeRates} currencyExchangeRates - The conversion rates.
 * @returns {IPriceChartDataset} The chart data with transformed currency values.
 */
const convertChartData = (
  chartData: IPriceChartDataset,
  fromCurrency: TCurrencyString,
  toCurrency: TCurrencyString,
  currencyExchangeRates: TCurrencyExchangeRates,
): IPriceChartDataset => ({
  ...chartData,
  datasets: chartData.datasets.map((dataset) => ({
    ...dataset,
    label: `${dataset.label.split(" ").slice(0, -1).join(" ")} ${toCurrency}`,
    data: dataset.data.map((value) =>
      convertCurrency(value, fromCurrency, toCurrency, currencyExchangeRates),
    ),
  })),
});

/**
 * Converts the currency for market chart data.
 *
 * @param {ITimeSeriesPriceData} marketChart - The original market chart data.
 * @param {TCurrencyString} fromCurrency - The source currency code.
 * @param {TCurrencyString} toCurrency - The target currency code.
 * @param {TCurrencyExchangeRates} currencyExchangeRates - The conversion rates.
 * @returns {ITimeSeriesPriceData} The market chart data with transformed currency values.
 */
const convertMarketChart = (
  marketChart: ITimeSeriesPriceData,
  fromCurrency: TCurrencyString,
  toCurrency: TCurrencyString,
  currencyExchangeRates: TCurrencyExchangeRates,
): ITimeSeriesPriceData => ({
  ...marketChart,
  h24: marketChart.h24.map((dataPoint) => [
    dataPoint[0],
    convertCurrency(
      dataPoint[1],
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
  ]),
  week: marketChart.week.map((dataPoint) => [
    dataPoint[0],
    convertCurrency(
      dataPoint[1],
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
  ]),
  month: marketChart.month.map((dataPoint) => [
    dataPoint[0],
    convertCurrency(
      dataPoint[1],
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
  ]),
  year: marketChart.year.map((dataPoint) => [
    dataPoint[0],
    convertCurrency(
      dataPoint[1],
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
  ]),
});

/**
 * Converts the currency for market values.
 *
 * @param {IPriceTrendData} marketValues - The original market values.
 * @param {TCurrencyString} fromCurrency - The source currency code.
 * @param {TCurrencyString} toCurrency - The target currency code.
 * @param {ObjTCurrencyExchangeRatesect} currencyExchangeRates - The conversion rates.
 * @returns {IPriceTrendData} The market values with transformed currency values.
 */
const convertMarketValues = (
  marketValues: IPriceTrendData,
  fromCurrency: TCurrencyString,
  toCurrency: TCurrencyString,
  currencyExchangeRates: TCurrencyExchangeRates,
): IPriceTrendData => ({
  ...marketValues,
  h24MarketValues: marketValues.h24MarketValues.map((value) =>
    convertCurrency(value, fromCurrency, toCurrency, currencyExchangeRates),
  ),
  weekMarketValues: marketValues.weekMarketValues.map((value) =>
    convertCurrency(value, fromCurrency, toCurrency, currencyExchangeRates),
  ),
  monthMarketValues: marketValues.monthMarketValues.map((value) =>
    convertCurrency(value, fromCurrency, toCurrency, currencyExchangeRates),
  ),
  yearMarketValues: marketValues.yearMarketValues.map((value) =>
    convertCurrency(value, fromCurrency, toCurrency, currencyExchangeRates),
  ),
});

/**
 * Transforms the currency data for a single coin's detailed data.
 *
 * @param {ICoinDetails} coinToTransform The coin's data to transform.
 * @param {TCurrencyString} fromCurrency The source currency code.
 * @param {TCurrencyString} toCurrency The target currency code.
 * @param {TCurrencyExchangeRates} currencyExchangeRates The conversion rates.
 * @returns {ICoinDetails} The coin's data with transformed currency values.
 */
const transformCurrencyForCoinDetails = (
  coinToTransform: ICoinDetails,
  fromCurrency: TCurrencyString,
  toCurrency: TCurrencyString,
  currencyExchangeRates: TCurrencyExchangeRates,
): ICoinDetails => ({
  ...coinToTransform,
  coinAttributes: {
    ...coinToTransform.coinAttributes,
    current_price: convertCurrency(
      coinToTransform.coinAttributes.current_price,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
    total_market_cap: convertCurrency(
      coinToTransform.coinAttributes.total_market_cap,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
    price_change_24h: convertCurrency(
      coinToTransform.coinAttributes.price_change_24h,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
    price_change_7d: convertCurrency(
      coinToTransform.coinAttributes.price_change_7d,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
    price_change_30d: convertCurrency(
      coinToTransform.coinAttributes.price_change_30d,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
    price_change_365d: convertCurrency(
      coinToTransform.coinAttributes.price_change_365d,
      fromCurrency,
      toCurrency,
      currencyExchangeRates,
    ),
  },
  timeSeriesPriceData: convertMarketChart(
    coinToTransform.timeSeriesPriceData,
    fromCurrency,
    toCurrency,
    currencyExchangeRates,
  ),
  priceTrendData: convertMarketValues(
    coinToTransform.priceTrendData,
    fromCurrency,
    toCurrency,
    currencyExchangeRates,
  ),
  priceChartDataset: convertChartData(
    coinToTransform.priceChartDataset,
    fromCurrency,
    toCurrency,
    currencyExchangeRates,
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
onmessage = (event: MessageEvent) => {
  const { requestType, requestData } = event.data;

  switch (requestType) {
    case CTWRequestType.TRANSFORM_COIN_DETAILS_CURRENCY:
      const transformedCoinDetails = transformCurrencyForCoinDetails(
        requestData.coinToTransform,
        requestData.fromCurrency,
        requestData.toCurrency,
        requestData.currencyExchangeRates,
      );
      postMessage({
        responseType: CTWResponseType.TRANSFORMED_COIN_DETAILS,
        transformedData: transformedCoinDetails,
        toCurrency: requestData.toCurrency,
      });
      break;

    case CTWRequestType.TRANSFORM_ALL_COIN_DETAILS_CURRENCIES:
      // Extract the necessary data for the transformation
      const {
        coinToTransform,
        fromCurrency: coinFromCurrency,
        currencyExchangeRates: coinCurrencyExchangeRates,
        currenciesToExclude: coinCurrenciesToExclude,
      } = requestData;

      let coinTargetCurrencies = ALL_CURRENCIES;

      if (coinCurrenciesToExclude?.length > 0) {
        // Filter out the excluded currency from the list of all currencies if it exists
        coinTargetCurrencies = coinTargetCurrencies.filter(
          (currency) => !coinCurrenciesToExclude.includes(currency),
        );
      }

      // Create an object to store the transformed data for each target currency
      const coinDetailsTransformedData: Record<TCurrencyString, ICoinDetails> =
        {};

      coinTargetCurrencies.forEach((targetCurrency) => {
        coinDetailsTransformedData[targetCurrency] =
          transformCurrencyForCoinDetails(
            coinToTransform,
            coinFromCurrency,
            targetCurrency,
            coinCurrencyExchangeRates,
          );
      });

      postMessage({
        responseType: CTWResponseType.TRANSFORMED_ALL_COIN_DETAILS,
        transformedData: coinDetailsTransformedData,
      });
      break;

    case CTWRequestType.TRANSFORM_POPULAR_COINS_LIST_CURRENCY:
      const transformedPopularCoinsList = transformCurrencyForPopularCoinsList(
        requestData.coinsToTransform,
        requestData.fromCurrency,
        requestData.toCurrency,
        requestData.currencyExchangeRates,
      );

      postMessage({
        responseType: CTWResponseType.TRANSFORMED_POPULAR_COINS_LIST,
        transformedData: transformedPopularCoinsList,
        toCurrency: requestData.toCurrency,
      });
      break;

    case CTWRequestType.TRANSFORM_ALL_POPULAR_COINS_LIST_CURRENCIES:
      // Extract the necessary data for the transformation
      const {
        coinsToTransform,
        fromCurrency,
        currenciesToExclude,
        currencyExchangeRates,
      } = requestData;

      let targetCurrencies = ALL_CURRENCIES;

      if (currenciesToExclude?.length > 0) {
        // Filter out the excluded currencies from the list of all currencies if it exists
        targetCurrencies = targetCurrencies.filter(
          (currency) => !currenciesToExclude.includes(currency),
        );
      }

      // Create an object to store the transformed data for each target currency
      const popularCoinsListTransformedData: Record<
        TCurrencyString,
        ICoinOverview[]
      > = {};

      targetCurrencies.forEach((targetCurrency) => {
        popularCoinsListTransformedData[targetCurrency] =
          transformCurrencyForPopularCoinsList(
            coinsToTransform,
            fromCurrency,
            targetCurrency,
            currencyExchangeRates,
          );
      });

      postMessage({
        responseType: CTWResponseType.TRANSFORMED_ALL_POPULAR_COINS_LIST,
        transformedData: popularCoinsListTransformedData,
      });
      break;

    default:
      // Handle any unexpected message types
      console.warn(`Unexpected message type received: ${requestType}`);
  }
};

// Transform Request types
enum CTWRequestType {
  TRANSFORM_COIN_DETAILS_CURRENCY = "transformCoinDetailsCurrency",
  TRANSFORM_ALL_COIN_DETAILS_CURRENCIES = "transformAllCoinDetailsCurrencies",
  TRANSFORM_POPULAR_COINS_LIST_CURRENCY = "transformPopularCoinsListCurrency",
  TRANSFORM_ALL_POPULAR_COINS_LIST_CURRENCIES = "transformAllPopularCoinsListCurrencies",
}

// Transform Response Types
enum CTWResponseType {
  TRANSFORMED_COIN_DETAILS = "TRANSFORMED_COIN_DETAILS",
  TRANSFORMED_ALL_COIN_DETAILS = "TRANSFORMED_ALL_COIN_DETAILS",
  TRANSFORMED_POPULAR_COINS_LIST = "TRANSFORMED_POPULAR_COINS_LIST",
  TRANSFORMED_ALL_POPULAR_COINS_LIST = "TRANSFORMED_ALL_POPULAR_COINS_LIST",
}

// Other Types taht can't be imported

type TCurrencyString = (typeof ALL_CURRENCIES)[number];

type TCurrencyExchangeRates = Record<TCurrencyString, TCurrencyRates>;

type TCurrencyRates = {
  [Currency in TCurrencyString]: number;
};

// Popular Coins
interface ICoinOverview {
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  total_market_cap: number;
  market_cap_rank: number;
  volume_24h: number;
  price_change_percentage_24h: number;
}

// Coin Details

interface ICoinDetails {
  id: string;
  currency: TCurrencyString;
  coinAttributes: ICoinDetailAttributes;
  timeSeriesPriceData: ITimeSeriesPriceData;
  priceTrendData: IPriceTrendData;
  priceChartDataset: IPriceChartDataset;
}

interface ICoinDetailAttributes extends ICoinOverview {
  description: string;
  price_change_24h: number;
  price_change_7d: number;
  price_change_30d: number;
  price_change_365d: number;
  // price_change_percentage_24h is inherited from ICoinOverview
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  price_change_percentage_1y: number;
}

// Coin Details - Historical Data

interface ITimeSeriesPriceData {
  h24: Array<[number, number]>;
  week: Array<[number, number]>;
  month: Array<[number, number]>;
  year: Array<[number, number]>;
}

interface IPriceTrendData {
  h24MarketValues: number[];
  weekMarketValues: number[];
  monthMarketValues: number[];
  yearMarketValues: number[];
}

interface IPriceChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    type: string;
    pointRadius: number;
    borderColor: string;
  }[];
}

// interface IPeriodicPriceChanges {
//   priceChange24h: number;
//   priceChange7d: number;
//   priceChange30d: number;
//   priceChange365d: number;
// }

// interface IPeriodicPriceChangePercentages {
//   h24: number;
//   d7: number;
//   d30: number;
//   d365: number;
// }
