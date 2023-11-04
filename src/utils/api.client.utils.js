import { SYMBOLS_BY_CURRENCIES } from "../global/constants";
import { initialCoinsState } from "../store/coins";
import { initialCurrencyState } from "../store/currency";
import {
  formatCoinDetailsData,
  formatCurrencyRates,
  mapPopularCoinsToShallowDetailedAttributes,
} from "./dataFormat.utils";

/**
 * Fetches and formats the top 100 coins, trending coins, and currency exchange rate data from CryptoCompare for the specified currency.
 *
 * @function
 * @async
 * @param {string} [targetCurrency] - The target currency for which data should be fetched.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *  - `currencyRates` {Object} - Exchange rates for various currencies.
 *  - `popularCoinsList` {Array<Object>} - List of the top 100 coins with their details.
 *  - `trendingCarouselCoins` {Array<Object>} - List of the top 10 coins from the top 100 list.
 *
 * @throws {Error} Throws an error if there's an issue fetching data.
 */
export async function fetchPopularCoinsData(
  targetCurrency = initialCurrencyState.initialCurrency,
) {
  console.warn("fetchPopularCoinsData");
  const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: {
      Authorization: `Apikey ${apiKey}`,
    },
  };

  let currencyRates;
  let popularCoinsList;
  let trendingCarouselCoins;

  const urls = [
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=CAD&tsyms=USD,AUD,GBP`,
    `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=100&tsym=${targetCurrency}`,
  ];

  try {
    // Fetch data concurrently using Promise.all
    const [exchangeData, assetsData] = await Promise.all(
      urls.map((url) => fetch(url, fetchOptions).then((res) => res.json())),
    );

    // Extract currency rates from exchange data
    currencyRates = formatCurrencyRates(exchangeData);

    popularCoinsList = assetsData.Data.map((entry, i) => {
      const coin = entry.CoinInfo;
      const metrics = entry.RAW?.[targetCurrency];
      if (!metrics) {
        // console.warn(`Metrics not found for coin: ${coin.Name}`);
        return null;
      }

      return {
        id: coin.Name,
        symbol: coin.Name,
        name: coin.FullName,
        image: `https://cryptocompare.com${coin.ImageUrl}`,
        current_price: metrics.PRICE,
        market_cap: metrics.MKTCAP,
        market_cap_rank: i + 1,
        total_volume: metrics.TOTALVOLUME24HTO,
        high_24h: metrics.HIGH24HOUR,
        low_24h: metrics.LOW24HOUR,
        price_change_24h: metrics.CHANGE24HOUR,
        price_change_percentage_24h: metrics.CHANGEPCT24HOUR,
        circulating_supply: metrics.SUPPLY,
      };
    }).filter(Boolean);

    trendingCarouselCoins = popularCoinsList.slice(0, 10);
    console.warn("fetchPopularCoinsData successful!");
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return {
    currencyRates,
    popularCoinsList,
    trendingCarouselCoins,
  };
}

/**
 * Fetches in-depth details for a specific coin, including its historical data, for the specified currency.
 *
 * @param {string} id - The coin identifier.
 * @param {string} targetCurrency - The target currency for conversions.
 * @param {boolean} [clientFetch=false] - Whether or not this fetch is from the client. If it is, we should use the proxy for coinPaprika api calls.
 * @returns {Object} An object containing details of the coin and other related data.
 */
export async function fetchCoinDetailsData(
  id,
  targetCurrency = initialCurrencyState.initialCurrency,
) {
  console.warn("fetchCoinDetailsData", id);
  const cryptoCompareApiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const cryptoCompareFetchOptions = {
    headers: {
      Authorization: `Apikey ${cryptoCompareApiKey}`,
    },
  };

  let formattedData;

  const urls = [
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${id.toUpperCase()},CAD&tsyms=USD,AUD,GBP,CAD`,
    `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${id.toUpperCase()}`,
    `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${id}&tsym=${targetCurrency}&limit=24`,
    `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${id}&tsym=${targetCurrency}&limit=365`,
  ];

  try {
    const [cryptoCompareData, assetData, dayData, yearData] = await Promise.all(
      urls.map((url) =>
        fetch(url, cryptoCompareFetchOptions).then((res) => res.json()),
      ),
    );

    if (
      !cryptoCompareData ||
      !cryptoCompareData.RAW ||
      !cryptoCompareData.RAW[id.toUpperCase()] ||
      cryptoCompareData.Response === "Error"
    ) {
      console.error(
        cryptoCompareData,
        "Error from CryptoCompare response.",
        cryptoCompareData,
      );
      return null;
    }

    formattedData = formatCoinDetailsData(
      cryptoCompareData,
      assetData,
      dayData,
      yearData,
      id,
      targetCurrency,
    );
    const currencyRates = formatCurrencyRates(cryptoCompareData);

    // Add the currencyRates to the formattedData
    formattedData.currencyRates = currencyRates;

    console.warn("fetchCoinDetailsData successful!", id);
  } catch (err) {
    console.error("Err fetching data - fetchCoinDetailsData", err);
  }

  return formattedData;
}

/**
 * Fetches the data for PopularCoinsList cache initialization based on the specified currency.
 *
 * @async
 * @function
 * @param {string} targetCurrency - The target currency for which data should be fetched.
 * @returns {Promise<Object>} Returns an object containing the coins and currency data.
 * @throws Will return default state objects for coins and currency if there's an error in fetching.
 */
export async function getPopularCoinsCacheData(targetCurrency) {
  console.log("getPopularCoinsCacheData for: ", targetCurrency);

  // Default State in case the fetch fails
  let result = {
    coins: { ...initialCoinsState },
    currency: {
      currentCurrency: targetCurrency,
      symbol: SYMBOLS_BY_CURRENCIES[targetCurrency],
    },
  };

  try {
    const { currencyRates, popularCoinsList, trendingCarouselCoins } =
      await fetchPopularCoinsData(targetCurrency);
    const shallowCoinDetails =
      mapPopularCoinsToShallowDetailedAttributes(popularCoinsList);

    console.log("getPopularCoinsCacheData successful!");

    result.coins.displayedPopularCoinsList = popularCoinsList;
    result.coins.trendingCarouselCoins = trendingCarouselCoins;
    result.coins.popularCoinsListByCurrency = {
      [targetCurrency]: popularCoinsList,
    };
    result.coins.cachedCoinDetailsByCurrency = {
      [targetCurrency]: shallowCoinDetails,
    };

    result.currency.currencyRates = currencyRates;
    result.currency.currentCurrency = targetCurrency;
    result.currency.symbol = SYMBOLS_BY_CURRENCIES[targetCurrency];
  } catch (err) {
    console.error("Err retrieving data - getPopularCoinsCacheData", err);
  }

  return result;
}
