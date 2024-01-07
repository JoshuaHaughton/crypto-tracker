import { isValid } from "./global.utils";

// Formatting CoinDetails after retrieval from the API

/**
 * Extracts and formats market chart values.
 *
 * @param {Object} dayData - Data for the day.
 * @param {Object} weekData - Data for the week.
 * @param {Object} monthData - Data for the month.
 * @param {Object} yearData - Data for the year.
 * @returns {Object} An object containing formatted market chart values.
 */
function extractMarketChartValues(dayData, weekData, monthData, yearData) {
  return {
    day: dayData.Data.Data.map((data) => [data.time, data.close]),
    week: weekData.Data.Data.map((data) => [data.time, data.close]),
    month: monthData.Data.Data.map((data) => [data.time, data.close]),
    year: yearData.Data.Data.map((data) => [data.time, data.close]),
  };
}

/**
 * Extracts market values from the provided data.
 *
 * @param {Object} dayData - Data for the day.
 * @param {Object} weekData - Data for the week.
 * @param {Object} monthData - Data for the month.
 * @param {Object} yearData - Data for the year.
 * @returns {Object} An object containing market values.
 */
function extractMarketValues(dayData, weekData, monthData, yearData) {
  return {
    dayMarketValues: dayData.Data.Data.map((data) => data.close),
    weekMarketValues: weekData.Data.Data.map((data) => data.close),
    monthMarketValues: monthData.Data.Data.map((data) => data.close),
    yearMarketValues: yearData.Data.Data.map((data) => data.close),
  };
}

/**
 * Extracts and formats chart values.
 *
 * @param {Object} marketChartValues - The market chart values.
 * @param {Object} marketValues - The market values.
 * @param {string} coinName - The name of the coin.
 * @param {string} targetCurrency - The target currency.
 * @returns {Object} An object containing formatted chart values.
 */
function extractChartValues(
  marketChartValues,
  marketValues,
  coinName,
  targetCurrency,
) {
  return {
    labels: marketChartValues?.day.map((data) =>
      new Date(data[0]).toLocaleTimeString(),
    ),
    datasets: [
      {
        label: `${coinName} Price (Past day) in ${targetCurrency.toUpperCase()}`,
        data: marketValues.dayMarketValues,
        type: "line",
        pointRadius: 1.3,
        borderColor: "#ff9500",
      },
    ],
  };
}

/**
 * Calculates price changes based on the provided yearly data.
 *
 * @param {Array<Object>} yearData - Array containing data for the year.
 * @returns {Object} An object containing calculated price changes.
 */
function calculatePriceChanges(yearData) {
  const data365 = yearData.Data.Data;
  const data30 = data365.slice(-30);
  const data7 = data365.slice(-7);
  const data1 = data365.slice(-1);

  return {
    priceChange1d: data1[0].close - data365[data365.length - 2].close,
    priceChange7d: data7[data7.length - 1].close - data7[0].close,
    priceChange30d: data30[data30.length - 1].close - data30[0].close,
    priceChange365d: data365[data365.length - 1].close - data365[0].close,
  };
}

/**
 * Calculates price change percentages based on price changes and year data.
 *
 * @param {Object} priceChanges - Object containing price changes.
 * @param {Array<Object>} yearData - Array containing data for the year.
 * @returns {Object} An object containing calculated price change percentages.
 */
function calculatePriceChangePercentages(priceChanges, yearData) {
  const data365 = yearData.Data.Data;
  const data30 = data365.slice(-30);
  const data7 = data365.slice(-7);

  const priceChangePercentage1d =
    (priceChanges.priceChange1d / data365[data365.length - 2].close) * 100;
  const priceChangePercentage7d =
    (priceChanges.priceChange7d / data7[0].close) * 100;
  const priceChangePercentage30dRaw =
    (priceChanges.priceChange30d / data30[0].close) * 100;
  const priceChangePercentage365dRaw =
    (priceChanges.priceChange365d / data365[0].close) * 100;

  const priceChangePercentage30d = !isValid(priceChangePercentage30dRaw)
    ? priceChangePercentage7d
    : priceChangePercentage30dRaw;
  const priceChangePercentage365d = !isValid(priceChangePercentage365dRaw)
    ? priceChangePercentage30d
    : priceChangePercentage365dRaw;

  return {
    d1: priceChangePercentage1d,
    d7: priceChangePercentage7d,
    d30: priceChangePercentage30d,
    d365: priceChangePercentage365d,
  };
}

/**
 * Formats the coin details data fetched from the API s that it can be stored in Redux and caches.
 *
 * @param {Object} cryptoCompareData - The main data from the API.
 * @param {Object} assetData - Additional asset data.
 * @param {Object} dayData - Data for the day.
 * @param {Object} yearData - Data for the year.
 * @param {string} id - The ID for the Coin.
 * @param {string} targetCurrency - The target currency for the formatting.
 * @returns {Object} An object containing formatted coin details.
 */
export function formatCoinDetailsData(
  cryptoCompareData,
  assetData,
  dayData,
  yearData,
  id,
  targetCurrency,
) {
  const coinData = cryptoCompareData.RAW[id.toUpperCase()][targetCurrency];
  const assetDataDetails = assetData.Data;

  // Derive 7-day and 30-day data from the 365-day data
  const weekData = {
    Data: {
      Data: yearData.Data.Data.slice(-7),
    },
  };
  const monthData = {
    Data: {
      Data: yearData.Data.Data.slice(-30),
    },
  };

  const marketChartValues = extractMarketChartValues(
    dayData,
    weekData,
    monthData,
    yearData,
  );
  const marketValues = extractMarketValues(
    dayData,
    weekData,
    monthData,
    yearData,
  );
  const chartValues = extractChartValues(
    marketChartValues,
    marketValues,
    assetDataDetails.NAME,
    targetCurrency,
  );

  const priceChanges = calculatePriceChanges(yearData);
  const priceChangePercentages = calculatePriceChangePercentages(
    priceChanges,
    yearData,
  );

  const coinAttributes = {
    id,
    symbol: coinData.FROMSYMBOL,
    name: assetDataDetails.NAME,
    image: assetDataDetails.LOGO_URL,
    description: assetDataDetails.ASSET_DESCRIPTION_SUMMARY,
    current_price: coinData.PRICE,
    market_cap: coinData.MKTCAP,
    price_change_1d: priceChanges.priceChange1d,
    price_change_percentage_24h: priceChangePercentages.d1,
    price_change_7d: priceChanges.priceChange7d,
    price_change_percentage_7d: priceChangePercentages.d7,
    price_change_30d: priceChanges.priceChange30d,
    price_change_percentage_30d: priceChangePercentages.d30,
    price_change_365d: priceChanges.priceChange365d,
    price_change_percentage_1y: priceChangePercentages.d365,
  };

  return {
    coinAttributes,
    marketChartValues,
    marketValues,
    chartValues,
    // currencyRates is computed in the main function
  };
}

// Formatting Currency rates after retrieval from the API

/**
 * Converts the exchange data from the API into a structured format for easier currency conversions.
 *
 * The function takes in raw exchange data and processes it to provide conversion rates between
 * different currency pairs. The resulting object provides a way to get conversion rates between
 * any two supported currencies.
 *
 * @param {Object} exchangeData - The raw exchange data from the API.
 * @returns {Object} An object representing conversion rates between supported currency pairs.
 */
export function formatCurrencyRates(exchangeData) {
  // Extracting conversion rates for CAD
  const cadRates = {
    CAD: 1,
    USD: exchangeData.RAW.CAD.USD.PRICE,
    AUD: exchangeData.RAW.CAD.AUD.PRICE,
    GBP: exchangeData.RAW.CAD.GBP.PRICE,
  };

  // Extracting conversion rates for USD using CAD as the base
  const usdRates = {
    CAD: 1 / cadRates.USD,
    USD: 1,
    AUD: cadRates.AUD / cadRates.USD,
    GBP: cadRates.GBP / cadRates.USD,
  };

  // Extracting conversion rates for AUD using CAD as the base
  const audRates = {
    CAD: 1 / cadRates.AUD,
    USD: cadRates.USD / cadRates.AUD,
    AUD: 1,
    GBP: cadRates.GBP / cadRates.AUD,
  };

  // Extracting conversion rates for GBP using CAD as the base
  const gbpRates = {
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
 * Extracts and maps attributes from the PopularCoins lists to be used as the shallow CoinDetails for each coin prior to preloading. THis allows us to maintain consistent valus that appear in the list, as well as the details page.
 *
 * @param {Array} popularCoinsList - The list of popular coins with basic attributes.
 * @returns {Object} An object where each key is a coin's id and the value is an object with a single key `coinAttributes` that points to the coin's data.
 */
export function mapPopularCoinsToShallowDetailedAttributes(popularCoinsList) {
  // Ensure the input is an array and has data
  if (!Array.isArray(popularCoinsList) || popularCoinsList.length === 0) {
    return {};
  }

  return popularCoinsList.reduce((acc, coin) => {
    acc[coin.id] = { coinAttributes: coin };
    return acc;
  }, {});
}