import { initialCoinsState } from "@/lib/store/coins/coinsSlice";

const ALL_CURRENCIES = ["CAD", "USD", "AUD", "GBP"] as const;

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
 * Responsibilities:
 * - This worker performs currency conversions on various datasets off the main thread.
 *   This approach ensures that these potentially computationally intensive operations
 *   do not interfere with the main thread, avoiding UI freezes or lags.
 *
 * Lifecycle in the Currency Transformer Context:
 * 1. The main thread sends a message to this worker with data that needs to be transformed.
 * 2. Upon receiving the message, this worker carries out the necessary transformations.
 * 3. After completing the task, the worker sends the transformed data back to the main thread.
 *
 * Callback Handling:
 * - Each message can optionally include an 'onCompleteCallbackId'.
 * - This ID is associated with a specific callback function stored in the 'callbacksMap' on the main thread.
 * - When the worker posts the result back, it includes this 'callbackId'.
 * - The main thread uses this ID to retrieve and execute the corresponding callback function.
 * - This mechanism allows asynchronous, yet specific post-processing actions tied to the worker's task completion.
 *
 * Restrictions:
 * - This file contains no imports due to limitations in many Web Worker environments regarding ES modules.
 * - Therefore, all necessary functions or variables are defined within this worker or passed in the message data.
 *
 * @listens message
 * @param {CTWInternalRequestMessageEvent} event - The message event containing data for transformation.
 */
onmessage = (event: CTWInternalRequestMessageEvent) => {
  const { requestType, requestData, onCompleteCallbackId } = event.data;

  switch (requestType) {
    case CTWMessageRequestType.COIN_DETAILS_SINGLE_CURRENCY:
      const coinDetailsData = requestData as CTWCoinDetailsRequestData;
      const transformedCoinDetails = transformCurrencyForCoinDetails(
        coinDetailsData.coinToTransform,
        coinDetailsData.fromCurrency,
        coinDetailsData.toCurrency,
        coinDetailsData.currencyExchangeRates,
      );
      postMessage({
        responseType: CTWResponseType.COIN_DETAILS_SINGLE_CURRENCY,
        transformedData: transformedCoinDetails,
        toCurrency: coinDetailsData.toCurrency,
        onCompleteCallbackId,
      });
      break;

    case CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES:
      // Extract the necessary data for the transformation
      const allCoinDetailsData = requestData as CTWAllCoinDetailsRequestData;
      const allCoinDetailsTransformedData =
        {} as CTWAllCoinDetailsExternalResponseData["transformedData"];

      ALL_CURRENCIES.filter(
        (currency) =>
          !allCoinDetailsData.currenciesToExclude?.includes(currency),
      ).forEach((targetCurrency) => {
        allCoinDetailsTransformedData[targetCurrency] =
          transformCurrencyForCoinDetails(
            allCoinDetailsData.coinToTransform,
            allCoinDetailsData.fromCurrency,
            targetCurrency,
            allCoinDetailsData.currencyExchangeRates,
          );
      });

      postMessage({
        responseType: CTWResponseType.COIN_DETAILS_ALL_CURRENCIES,
        transformedData: allCoinDetailsTransformedData,
        onCompleteCallbackId,
      });
      break;

    case CTWMessageRequestType.POPULAR_COINS_SINGLE_CURRENCY:
      const popularCoinsListData =
        requestData as CTWPopularCoinsListRequestData;
      const transformedPopularCoinsList = transformCurrencyForPopularCoinsList(
        popularCoinsListData.coinsToTransform,
        popularCoinsListData.fromCurrency,
        popularCoinsListData.toCurrency,
        popularCoinsListData.currencyExchangeRates,
      );

      postMessage({
        responseType: CTWResponseType.POPULAR_COINS_SINGLE_CURRENCY,
        transformedData: transformedPopularCoinsList,
        toCurrency: popularCoinsListData.toCurrency,
        onCompleteCallbackId,
      });
      break;

    case CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES:
      // Extract the necessary data for the transformation
      const allPopularCoinsListData =
        requestData as CTWAllPopularCoinsListsRequestData;
      const allPopularCoinsListTransformedData =
        {} as CTWAllPopularCoinsListsExternalResponseData["transformedData"];

      ALL_CURRENCIES.filter(
        (currency) =>
          !allPopularCoinsListData.currenciesToExclude?.includes(currency),
      ).forEach((targetCurrency) => {
        allPopularCoinsListTransformedData[targetCurrency] =
          transformCurrencyForPopularCoinsList(
            allPopularCoinsListData.coinsToTransform,
            allPopularCoinsListData.fromCurrency,
            targetCurrency,
            allPopularCoinsListData.currencyExchangeRates,
          );
      });

      postMessage({
        responseType: CTWResponseType.POPULAR_COINS_ALL_CURRENCIES,
        transformedData: allPopularCoinsListTransformedData,
        onCompleteCallbackId,
      });
      break;

    default:
      // Handle any unexpected message types
      console.warn(`Unexpected message type received: ${requestType}`);
  }
};

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

// Specific callback types for each response type
type CTWCoinDetailsCallback = (
  response: CTWCoinDetailsExternalResponseData,
) => void;
type CTWAllCoinDetailsCallback = (
  response: CTWAllCoinDetailsExternalResponseData,
) => void;
type CTWPopularCoinsListCallback = (
  response: CTWPopularCoinsListExternalResponseData,
) => void;
type CTWAllPopularCoinsListsCallback = (
  response: CTWAllPopularCoinsListsExternalResponseData,
) => void;

type RequestTypeToRequestDataMap = {
  [CTWMessageRequestType.COIN_DETAILS_SINGLE_CURRENCY]: CTWCoinDetailsRequestData;
  [CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES]: CTWAllCoinDetailsRequestData;
  [CTWMessageRequestType.POPULAR_COINS_SINGLE_CURRENCY]: CTWPopularCoinsListRequestData;
  [CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES]: CTWAllPopularCoinsListsRequestData;
};

type RequestTypeToCallbackMap = {
  [CTWMessageRequestType.COIN_DETAILS_SINGLE_CURRENCY]: CTWCoinDetailsCallback;
  [CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES]: CTWAllCoinDetailsCallback;
  [CTWMessageRequestType.POPULAR_COINS_SINGLE_CURRENCY]: CTWPopularCoinsListCallback;
  [CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES]: CTWAllPopularCoinsListsCallback;
};

// REQUEST TYPES
interface CTWRequestMessage<T extends CTWMessageRequestType> {
  requestType: T;
  requestData: RequestTypeToRequestDataMap[T];
  onComplete?: RequestTypeToCallbackMap[T];
}

/**
 * CTWInternalRequestMessage extends CTWRequestMessage but replaces the onComplete property
 * with onCompleteCallbackId. This ID is used internally to track and handle the callback function
 * associated with the worker's response, ensuring the correct function is executed upon task completion.
 */
interface CTWInternalRequestMessage
  extends Omit<CTWRequestMessage<CTWMessageRequestType>, "onComplete"> {
  onCompleteCallbackId?: string;
}

enum CTWMessageRequestType {
  COIN_DETAILS_SINGLE_CURRENCY = "transformCoinDetailsCurrency",
  COIN_DETAILS_ALL_CURRENCIES = "transformAllCoinDetailsCurrencies",
  POPULAR_COINS_SINGLE_CURRENCY = "transformPopularCoinsListCurrency",
  POPULAR_COINS_ALL_CURRENCIES = "transformAllPopularCoinsListCurrencies",
}

// Types for the data object based on each REQUEST case
interface CTWCoinDetailsRequestData {
  coinToTransform: any;
  fromCurrency: TCurrencyString;
  toCurrency: TCurrencyString;
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
}

interface CTWAllCoinDetailsRequestData {
  coinToTransform: any;
  fromCurrency: TCurrencyString;
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
  currenciesToExclude?: TCurrencyString[];
}

interface CTWPopularCoinsListRequestData {
  coinsToTransform: any[];
  fromCurrency: TCurrencyString;
  toCurrency: TCurrencyString;
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
}

interface CTWAllPopularCoinsListsRequestData {
  coinsToTransform: any[];
  fromCurrency: TCurrencyString;
  currenciesToExclude?: TCurrencyString[];
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
}

// Extend the MessageEvent interface to include the custom data structure
interface CTWInternalRequestMessageEvent extends MessageEvent {
  data: CTWInternalRequestMessage;
}

// RESPONSE TYPES

enum CTWResponseType {
  COIN_DETAILS_SINGLE_CURRENCY = "TRANSFORMED_COIN_DETAILS",
  COIN_DETAILS_ALL_CURRENCIES = "TRANSFORMED_ALL_COIN_DETAILS",
  POPULAR_COINS_SINGLE_CURRENCY = "TRANSFORMED_POPULAR_COINS_LIST",
  POPULAR_COINS_ALL_CURRENCIES = "TRANSFORMED_ALL_POPULAR_COINS_LIST",
}

interface CTWCoinDetailsExternalResponseData {
  responseType: CTWResponseType.COIN_DETAILS_SINGLE_CURRENCY;
  transformedData: ICoinDetails;
}

interface CTWAllCoinDetailsExternalResponseData {
  responseType: CTWResponseType.COIN_DETAILS_ALL_CURRENCIES;
  transformedData: Record<TCurrencyString, ICoinDetails>;
}

interface CTWPopularCoinsListExternalResponseData {
  responseType: CTWResponseType.POPULAR_COINS_SINGLE_CURRENCY;
  transformedData: ICoinOverview[];
}

interface CTWAllPopularCoinsListsExternalResponseData {
  responseType: CTWResponseType.POPULAR_COINS_ALL_CURRENCIES;
  transformedData: Record<TCurrencyString, ICoinOverview[]>;
}
