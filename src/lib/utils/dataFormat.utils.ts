import { TCurrencyString } from "@/lib/constants/globalConstants";
import {
  TCurrencyRates,
  TCurrencyExchangeRates,
} from "@/lib/types/currencyTypes";
import {
  ICoinDetails,
  ICoinDetailAttributes,
  IPriceChartDataset,
  IPeriodicPriceChangePercentages,
  ITimeSeriesPriceData,
  IPriceTrendData,
  IPeriodicPriceChanges,
  ICoinOverview,
  TShallowCoinDetails,
} from "@/lib/types/coinTypes";
import {
  IHistoricalDataApiResponse,
  IAssetDataApiResponse,
  ITop100MarketCapCoinFromAPI,
  IFormattedPopularCoinsApiResponse,
  IRawPopularCoinsApiResponse,
  IFormattedCoinDetailsAPIResponse,
  IRawCoinDetailsApiResponse,
} from "@/lib/types/apiResponseTypes";
import { CRYPTO_COMPARE_WEBSITE } from "@/lib/constants/apiConstants";
import { isNull, isPlainObject, isUndefined, mergeWith } from "lodash";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { ENumericThresholds } from "@/lib/types/numericTypes";

// Formatting CoinDetails after retrieval from the API

/**
 * Extracts and formats time-series price data from historical data.
 * @param h24Data - Data representing price movements over the past 24 hours.
 * @param weekData - Data representing price movements over the past week.
 * @param monthData - Data representing price movements over the past month.
 * @param yearData - Data representing price movements over the past year.
 * @returns An object containing time-series data of prices at different intervals.
 */
function formatTimeSeriesPriceData(
  h24Data: IHistoricalDataApiResponse,
  weekData: IHistoricalDataApiResponse,
  monthData: IHistoricalDataApiResponse,
  yearData: IHistoricalDataApiResponse,
): ITimeSeriesPriceData {
  return {
    h24: h24Data.Data.Data.map((data) => [data.time, data.close]),
    week: weekData.Data.Data.map((data) => [data.time, data.close]),
    month: monthData.Data.Data.map((data) => [data.time, data.close]),
    year: yearData.Data.Data.map((data) => [data.time, data.close]),
  };
}

/**
 * Extracts market values from the provided data.
 * @param h24Data - Data for the past 24 hours.
 * @param weekData - Data for the past week.
 * @param monthData - Data for the past month.
 * @param yearData - Data for the past 365 days.
 * @returns An object containing market values.
 */
function formatPriceTrendData(
  h24Data: IHistoricalDataApiResponse,
  weekData: IHistoricalDataApiResponse,
  monthData: IHistoricalDataApiResponse,
  yearData: IHistoricalDataApiResponse,
): IPriceTrendData {
  return {
    h24MarketValues: h24Data.Data.Data.map((data) => data.close),
    weekMarketValues: weekData.Data.Data.map((data) => data.close),
    monthMarketValues: monthData.Data.Data.map((data) => data.close),
    yearMarketValues: yearData.Data.Data.map((data) => data.close),
  };
}

/**
 * Prepares a dataset for charting based on time-series and trend data.
 * @param timeSeriesPriceData - The time-series data of market prices.
 * @param priceTrendData - The trend data showing market price movements.
 * @param coinName - The name of the coin.
 * @param targetCurrency - The currency in which prices are represented.
 * @returns A dataset suitable for rendering a price chart.
 */
function formatPriceChartDataset(
  timeSeriesPriceData: ITimeSeriesPriceData,
  priceTrendData: IPriceTrendData,
  coinName: string,
  targetCurrency: TCurrencyString,
): IPriceChartDataset {
  return {
    labels: timeSeriesPriceData.h24.map((data) =>
      new Date(data[0]).toLocaleTimeString(),
    ),
    datasets: [
      {
        label: `${coinName} Price (Past day) in ${targetCurrency.toUpperCase()}`,
        data: priceTrendData.h24MarketValues,
        type: "line",
        pointRadius: 1.3,
        borderColor: "#ff9500",
      },
    ],
  };
}

/**
 * Computes price changes over various periods by using the provided yearly data.
 * @param yearData - Historical data for the past year.
 * @returns An object with calculated price changes over different time frames.
 */
function calculatePriceChanges(
  yearData: IHistoricalDataApiResponse,
): IPeriodicPriceChanges {
  const data365 = yearData.Data.Data;

  // Define indices for clarity
  const lastIndex = data365.length - 1;
  const secondToLastIndex = lastIndex - 1;
  const oneWeekAgoIndex = lastIndex - 7;
  const oneMonthAgoIndex = lastIndex - 30;

  return {
    priceChange24h: data365[lastIndex].close - data365[secondToLastIndex].close,
    priceChange7d: data365[lastIndex].close - data365[oneWeekAgoIndex].close,
    priceChange30d: data365[lastIndex].close - data365[oneMonthAgoIndex].close,
    priceChange365d: data365[lastIndex].close - data365[0].close,
  };
}

/**
 * Computes percentage changes in price over various periods.
 * @param priceChanges - The computed price changes.
 * @param yearData - Historical data for the past year.
 * @returns An object with calculated percentage changes over different time frames.
 */
function calculatePriceChangePercentages(
  priceChanges: IPeriodicPriceChanges,
  yearData: IHistoricalDataApiResponse,
): IPeriodicPriceChangePercentages {
  const data365 = yearData.Data.Data;

  // Define indices for clarity
  const lastIndex = data365.length - 1;
  const secondToLastIndex = lastIndex - 1;
  const oneWeekAgoIndex = lastIndex - 7;
  const oneMonthAgoIndex = lastIndex - 30;

  // Define base values for percentage calculations
  const baseValue24h = data365[secondToLastIndex].close;
  const baseValue7d = data365[oneWeekAgoIndex].close;
  const baseValue30d = data365[oneMonthAgoIndex].close;
  const baseValue365d = data365[0].close;

  return {
    h24: calculatePercentageChange(priceChanges.priceChange24h, baseValue24h),
    d7: calculatePercentageChange(priceChanges.priceChange7d, baseValue7d),
    d30: calculatePercentageChange(priceChanges.priceChange30d, baseValue30d),
    d365: calculatePercentageChange(
      priceChanges.priceChange365d,
      baseValue365d,
    ),
  };
}

/**
 * Calculates the percentage change based on the provided change value and base value.
 *
 * @param change The change in value, which can be positive or negative.
 * @param baseValue The base value from which the change occurred. Must be non-zero to avoid division by zero.
 * @returns The percentage change calculated as (change / baseValue) * 100. If the base value is zero, it returns NaN to indicate an undefined or uncalculable result.
 */
function calculatePercentageChange(change: number, baseValue: number): number {
  if (baseValue === 0) {
    // Handling the case where base value is zero to avoid division by zero
    console.warn("Base value is zero. Percentage change is not calculable.");
    return NaN;
  }

  return (change / baseValue) * 100;
}

/**
 * Formats the coin details data fetched from the API for storage and presentation..
 * @param targetCurrency - The currency in which market data is represented.
 * @param currencyExchangeRates - Exchange rates for converting values to different currencies.
 * @param assetDataFromApi - Raw asset data fetched from the API.
 * @param h24Data - Historical data for the past 24 hours.
 * @param yearData - Historical data for the past year.
 * @returns A structured representation of detailed coin data.
 */
export function formatCoinDetailsFromApi(
  targetCurrency: TCurrencyString,
  currencyExchangeRates: TCurrencyExchangeRates,
  assetDataFromApi: IAssetDataApiResponse,
  h24Data: IHistoricalDataApiResponse,
  yearData: IHistoricalDataApiResponse,
): ICoinDetails {
  const assetDataDetails = assetDataFromApi.Data;

  // Derive 7-day and 30-day data from the 365-day data
  const weekData: IHistoricalDataApiResponse = {
    Data: { Data: yearData.Data.Data.slice(-7) },
  };
  const monthData: IHistoricalDataApiResponse = {
    Data: { Data: yearData.Data.Data.slice(-30) },
  };

  const timeSeriesPriceData = formatTimeSeriesPriceData(
    h24Data,
    weekData,
    monthData,
    yearData,
  );
  const priceTrendData = formatPriceTrendData(
    h24Data,
    weekData,
    monthData,
    yearData,
  );
  const priceChartDataset = formatPriceChartDataset(
    timeSeriesPriceData,
    priceTrendData,
    assetDataDetails.NAME,
    targetCurrency,
  );

  console.log("assetDataDetails", assetDataDetails);

  const priceChanges: IPeriodicPriceChanges = calculatePriceChanges(yearData);
  const priceChangePercentages: IPeriodicPriceChangePercentages =
    calculatePriceChangePercentages(priceChanges, yearData);

  const coinAttributes: ICoinDetailAttributes = {
    name: assetDataDetails.NAME,
    symbol: assetDataDetails.SYMBOL,
    image: assetDataDetails.LOGO_URL,
    description: assetDataDetails.ASSET_DESCRIPTION_SUMMARY,
    current_price:
      assetDataDetails.PRICE_USD * currencyExchangeRates.USD[targetCurrency],
    total_market_cap:
      assetDataDetails.TOTAL_MKT_CAP_USD *
      currencyExchangeRates.USD[targetCurrency],
    market_cap_rank:
      assetDataDetails.TOPLIST_BASE_RANK.SPOT_MOVING_24_HOUR_QUOTE_VOLUME_USD,
    volume_24h:
      assetDataDetails.SPOT_MOVING_24_HOUR_QUOTE_VOLUME_TOP_TIER_DIRECT_USD *
      currencyExchangeRates.USD[targetCurrency],
    price_change_24h: priceChanges.priceChange24h,
    price_change_percentage_24h: priceChangePercentages.h24,
    price_change_7d: priceChanges.priceChange7d,
    price_change_percentage_7d: priceChangePercentages.d7,
    price_change_30d: priceChanges.priceChange30d,
    price_change_percentage_30d: priceChangePercentages.d30,
    price_change_365d: priceChanges.priceChange365d,
    price_change_percentage_1y: priceChangePercentages.d365,
  };

  return {
    id: assetDataDetails.SYMBOL,
    currency: targetCurrency,
    coinAttributes,
    timeSeriesPriceData,
    priceTrendData,
    priceChartDataset,
  };
}

// Formatting Coin Overview (Popular Coins)

/**
 * Converts raw coin data into a more usable format.
 * @param entry - The raw data entry from the API response.
 * @param index - The index of the entry, used to determine market cap rank.
 * @param targetCurrency - The target currency for price conversion.
 * @returns The formatted coin overview, or null if the coin isn't formattable.
 */
export function formatCoinOverviewCoinFromApi(
  entry: ITop100MarketCapCoinFromAPI,
  index: number,
  targetCurrency: TCurrencyString,
): ICoinOverview | null {
  const coinInfo = entry.CoinInfo;
  const metrics = entry.RAW?.[targetCurrency];
  if (!metrics) return null;

  // Constructing and returning a formatted overview of the coin
  return {
    symbol: coinInfo.Name,
    name: coinInfo.FullName,
    image: `${CRYPTO_COMPARE_WEBSITE}${coinInfo.ImageUrl}`,
    current_price: metrics.PRICE,
    total_market_cap: metrics.MKTCAP,
    market_cap_rank: index + 1,
    volume_24h: metrics.TOTALVOLUME24HTO,
    price_change_percentage_24h: metrics.CHANGEPCT24HOUR,
  };
}

// Formatting Currency rates after retrieval from the API

/**
 * Extracts and formats currency conversion rates for all currencies using the given exchange data.
 * @param exchangeData - The raw exchange data from the API.
 * @returns An object containing formatted currency rates.
 */
export function formatCurrencyRates(
  exchangeData: TCurrencyRates,
): TCurrencyExchangeRates {
  // Using the default conversion rates for CAD
  const cadRates: TCurrencyRates = exchangeData;

  // Extracting conversion rates for other currencies using CAD as the base
  const usdRates: TCurrencyRates = {
    CAD: 1 / cadRates.USD,
    USD: 1,
    AUD: cadRates.AUD / cadRates.USD,
    GBP: cadRates.GBP / cadRates.USD,
  };

  const audRates: TCurrencyRates = {
    CAD: 1 / cadRates.AUD,
    USD: cadRates.USD / cadRates.AUD,
    AUD: 1,
    GBP: cadRates.GBP / cadRates.AUD,
  };

  const gbpRates: TCurrencyRates = {
    CAD: 1 / cadRates.GBP,
    USD: cadRates.USD / cadRates.GBP,
    AUD: cadRates.AUD / cadRates.GBP,
    GBP: 1,
  };

  return {
    CAD: cadRates,
    USD: usdRates,
    AUD: audRates,
    GBP: gbpRates,
  };
}

/**
 * Extracts and maps PopularCoins to be used as the shallow base for ShallowCoinDetails for each coin.
 *
 * @param {ICoinOverview[]} popularCoinsList - The list of popular coins with basic attributes.
 * @returns {Record<string, TShallowCoinDetails>} - An object where each key is the coin's symbol and the value is the coin's shallow detailed attributes.
 */
export function mapPopularCoinsToShallowDetailedAttributes(
  popularCoinsList: ICoinOverview[],
): Record<string, TShallowCoinDetails> {
  // Check if the input is an array and has elements
  if (!Array.isArray(popularCoinsList) || popularCoinsList.length === 0) {
    return {};
  }

  // Transform the list of popular coins into a map of shallow coin details
  return popularCoinsList.reduce((accumulator, coin) => {
    // Create a shallow TShallowCoinDetails object for each coin
    const shallowCoinDetails: TShallowCoinDetails = {
      id: coin.symbol, // Using the coin's symbol as the identifier
      coinAttributes: coin, // Directly use ICoinOverview attributes
    };

    // Add the shallow details to the accumulator with the coin's symbol as the key
    accumulator[coin.symbol] = shallowCoinDetails;
    return accumulator;
  }, {} as Record<string, TShallowCoinDetails>);
}

/**
 * Customizer function for lodash's mergeWith that tells mergeWith to selectively overwrite undefined and null values in the target object with values from the source object.
 * This customizer also ensures deep merging by recursively applying the same logic to nested properties.
 *
 * @param objValue - The current value from the target object.
 * @param srcValue - The current value from the source object.
 * @returns The merged value to use: source value if the original is null or undefined; otherwise, the original value.
 */
export function overwriteUndefinedAndNullValues(
  objValue: any,
  srcValue: any,
): any {
  // Apply custom merging rules recursively for plain objects
  if (isPlainObject(objValue) && isPlainObject(srcValue)) {
    return mergeWith({}, objValue, srcValue, overwriteUndefinedAndNullValues);
  }

  // For leaf values, overwrite only if the original value is null or undefined
  return isUndefined(objValue) || isNull(objValue) ? srcValue : objValue;
}

/**
 * Merges base coin details with additional details. If baseDetails is a CoinOverview, it merges it into the additionalDetails' coinAttributes.
 * If baseDetails is already CoinDetails, it merges the entire objects while prioritizing non-null and non-undefined baseDetails values.
 *
 * @param baseDetails - Base coin details which could be an overview or full details.
 * @param additionalDetails - Additional detailed data to merge.
 * @returns Merged coin details.
 */
export function mergeCoinDetails(
  baseDetails: ICoinOverview | ICoinDetails,
  additionalDetails: ICoinDetails,
): ICoinDetails {
  let mergedDetails: ICoinDetails;

  // Check if base details are shallow (ICoinOverview) or full (ICoinDetails)
  if ("priceChartDataset" in baseDetails) {
    // Checks if baseDetails is of type ICoinDetails
    // If baseDetails is already ICoinDetails, merge directly
    mergedDetails = mergeWith(
      {},
      baseDetails,
      additionalDetails,
      overwriteUndefinedAndNullValues,
    );
  } else {
    // If baseDetails is ICoinOverview, merge only into the additionalDetails' coinAttributes
    const updatedCoinAttributes = mergeWith(
      {},
      baseDetails,
      additionalDetails.coinAttributes,
      overwriteUndefinedAndNullValues,
    );
    // Ensure the merged coin attributes are set within the structure of additionalDetails
    mergedDetails = {
      ...additionalDetails,
      coinAttributes: updatedCoinAttributes,
    };
  }

  return mergedDetails;
}

/**
 * Selects a random subset of symbols from the popular coins list.
 *
 * @param {ICoinOverview[]} coins - Array of coin overview objects.
 * @param {number} count - Number of symbols to select.
 * @returns {string[]} Array of selected coin symbols.
 */
export function selectRandomPopularCoinsSubset(
  coins: ICoinOverview[],
  count: number,
): string[] {
  if (count > coins.length) {
    throw new Error("Requested count exceeds the number of available coins");
  }

  const selectedSymbols = new Set<string>();
  while (selectedSymbols.size < count) {
    const randomIndex = Math.floor(Math.random() * coins.length);
    selectedSymbols.add(coins[randomIndex].symbol);
  }

  return Array.from(selectedSymbols);
}

/**
 * Formats the raw popular coins data into a more usable structure.
 *
 * @param {IRawPopularCoinsApiResponse} rawData - The raw API response data.
 * @param {TCurrencyString} targetCurrency - The currency against which market data is compared.
 * @returns {IFormattedPopularCoinsApiResponse} An object containing formatted currency rates, popular coins list, and carousel symbols.
 */
export function formatPopularCoinsApiResponse(
  rawData: IRawPopularCoinsApiResponse,
  targetCurrency: TCurrencyString,
): IFormattedPopularCoinsApiResponse {
  const { exchangeData, top100MarketCapData } = rawData;

  // Format currency exchange rates
  const currencyExchangeRates = formatCurrencyRates(exchangeData);

  // Format popular coins list
  const popularCoins = top100MarketCapData.Data.map((entry, index) =>
    formatCoinOverviewCoinFromApi(entry, index, targetCurrency),
  ).filter(Boolean) as ICoinOverview[];

  // Selecting a random subset of 10 coin symbols
  const carouselSymbolList = selectRandomPopularCoinsSubset(popularCoins, 10);

  return { currencyExchangeRates, popularCoins, carouselSymbolList };
}

/**
 * Formats the raw coin details data into a structured and usable format.
 *
 * @param rawData - The raw API response data.
 * @param targetCurrency - The target currency for conversions.
 * @returns {IFormattedCoinDetailsAPIResponse} Formatted coin details including historical data.
 */
export function formatCoinDetailsApiResponse(
  rawData: IRawCoinDetailsApiResponse,
  targetCurrency: TCurrencyString,
): IFormattedCoinDetailsAPIResponse {
  const {
    exchangeRateResponse,
    assetDetailsResponse,
    historicalResponse24h,
    historicalResponse365d,
  } = rawData;

  const currencyExchangeRates = formatCurrencyRates(exchangeRateResponse);
  const coinDetails: ICoinDetails = formatCoinDetailsFromApi(
    targetCurrency,
    currencyExchangeRates,
    assetDetailsResponse,
    historicalResponse24h,
    historicalResponse365d,
  );

  return { coinDetails, currencyExchangeRates };
}
/**
 * Transforms popular coins into shallow coin details for each currency and updates the Redux store with the result.
 * This function can handle both a single set of popular coins data or a map of them.
 *
 * @param popularCoinsOrMap - Either a single array of popular coins data or a map of currencies to their respective popular coins data.
 * @param dispatch - The Redux dispatch function.
 * @param [currentCurrency] - The current currency context, required if popularCoinsOrMap is a single set of popular coins data.
 */
export function transformAndDispatchPopularCoinsToShallow(
  dispatch: Dispatch,
  popularCoinsOrMap: ICoinOverview[] | Record<TCurrencyString, ICoinOverview[]>,
  currentCurrency?: TCurrencyString,
): void {
  // Check if the input is a map or a single set of data
  if (!Array.isArray(popularCoinsOrMap) && currentCurrency === undefined) {
    // Handle map of popular coins
    Object.entries(popularCoinsOrMap).forEach(([currentCurrency, coins]) => {
      const shallowCoinDetails =
        mapPopularCoinsToShallowDetailedAttributes(coins);
      dispatch(
        coinsActions.setPreloadedCoinsMapForCurrency({
          currency: currentCurrency as TCurrencyString,
          coinDetailsMap: shallowCoinDetails,
        }),
      );
    });
  } else if (Array.isArray(popularCoinsOrMap) && currentCurrency) {
    // Handle a single set of popular coins
    const shallowCoinDetails =
      mapPopularCoinsToShallowDetailedAttributes(popularCoinsOrMap);
    dispatch(
      coinsActions.setPreloadedCoinsMapForCurrency({
        currency: currentCurrency,
        coinDetailsMap: shallowCoinDetails,
      }),
    );
  } else {
    throw new Error(
      "Invalid arguments passed to transformAndDispatchPopularCoinsToShallow",
    );
  }
}

/**
 * Filters out properties with undefined values from an object.
 * @param obj The object to filter.
 * @returns A new object with all undefined properties removed.
 */
export function filterUndefinedProps<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  return Object.entries(obj).reduce((acc: Partial<T>, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Formats a numeric value into a condensed string representation with suffixes.
 *
 * This function converts large numbers into a shorter format using the suffixes 'K' for thousands,
 * 'M' for millions, 'B' for billions, and 'T' for trillions. It's optimized to handle numbers
 * up to a trillion and ensures a single decimal point precision.
 *
 * @param num - The number to format.
 * @returns The formatted string representation of the number.
 *
 * @example
 * formatBigNumber(1234); // returns '1.2K'
 * formatBigNumber(1234567); // returns '1.2M'
 */
export const formatBigNumber = (num: number): string => {
  // Define thresholds for number ranges
  const { THOUSAND, MILLION, BILLION, TRILLION } = ENumericThresholds;

  // Check and format for the 'thousands' range
  if (num >= THOUSAND && num < MILLION) {
    return (num / THOUSAND).toFixed(1) + "K"; // Convert to 'K' format
  }

  // Check and format for the 'millions' range
  else if (num >= MILLION && num < BILLION) {
    return (num / MILLION).toFixed(1) + "M"; // Convert to 'M' format
  }

  // Check and format for the 'billions' range
  else if (num >= BILLION && num < TRILLION) {
    return (num / BILLION).toFixed(1) + "B"; // Convert to 'B' format
  }

  // Check and format for the 'trillions' range
  else if (num >= TRILLION) {
    return (num / TRILLION).toFixed(1) + "T"; // Convert to 'T' format
  }

  // Return the number as-is if it's less than 1000
  else {
    return num.toString(); // No formatting needed
  }
};
