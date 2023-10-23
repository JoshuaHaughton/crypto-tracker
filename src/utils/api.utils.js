import { parse } from "cookie";
import {
  FIVE_MINUTES_IN_MS,
  FIVE_MINUTES_IN_SECONDS,
  SYMBOLS_BY_CURRENCIES,
} from "../global/constants";
import { initialCoinsState } from "../store/coins";
import { initialCurrencyState } from "../store/currency";
import { getCurrencyRatesFromExchangeData } from "./global.utils";

/**
 * Fetches Top 100 assets, Trending Coins, & Exchange Rate data from CryptoCompare for the specified currency.
 *
 * @param {string} targetCurrency - The target currency for which data should be fetched.
 * @returns {Object} An object containing the initial rates, initial hundred coins, and trending carousel coins.
 */
export async function fetchPopularCoinsData(
  targetCurrency = initialCurrencyState.initialCurrency,
) {
  const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: {
      Authorization: `Apikey ${apiKey}`,
    },
  };

  // Fetching currencyRates for all currencies using CAD as the base
  const exchangeRateResponse = await fetch(
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=CAD&tsyms=USD,AUD,GBP`,
    fetchOptions,
  );
  const exchangeData = await exchangeRateResponse.json();
  console.warn("exchangeData - preload", exchangeData);

  const currencyRates = getCurrencyRatesFromExchangeData(exchangeData);

  // Fetching the top 100 assets by market cap from CryptoCompare in requested currency
  const assetsResponse = await fetch(
    `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=100&tsym=${targetCurrency}`,
    fetchOptions,
  );
  const assetsData = await assetsResponse.json();

  const initialHundredCoins = assetsData.Data.map((entry, i) => {
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

  const trendingCarouselCoins = initialHundredCoins.slice(0, 10);

  return {
    currencyRates,
    initialHundredCoins,
    trendingCarouselCoins,
  };
}

/**
 * Fetches details for a specific coin, including its historical data from CryptoCompare, for the specified currency.
 *
 * @param {string} id - The coin identifier.
 * @param {string} targetCurrency - The target currency for conversions.
 * @param {boolean} [clientFetch=false] - Whether or not this fetch is from the client. If it is, we should use the proxy for necessary api calls.
 * @returns {Object} An object containing details of the coin and other related data.
 */
export async function fetchCoinDetailsFromCryptoCompare(
  id,
  targetCurrency = initialCurrencyState.initialCurrency,
) {
  const cryptoCompareApiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const cryptoCompareFetchOptions = {
    headers: {
      Authorization: `Apikey ${cryptoCompareApiKey}`,
    },
  };

  const urls = [
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${id.toUpperCase()},CAD&tsyms=USD,AUD,GBP,CAD`,
    `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${id.toUpperCase()}`,
    `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${id}&tsym=${targetCurrency}&limit=24`,
    `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${id}&tsym=${targetCurrency}&limit=365`,
  ];
  console.log(urls);

  const [cryptoCompareData, assetDataR, dayData, yearData] = await Promise.all(
    urls.map((url) =>
      fetch(url, cryptoCompareFetchOptions).then((res) => res.json()),
    ),
  );

  if (cryptoCompareData.Response === "Error") {
    console.error(cryptoCompareData, ". returning");
    return null;
  }

  const currencyRates = getCurrencyRatesFromExchangeData(cryptoCompareData);

  const coinData = cryptoCompareData.RAW[id.toUpperCase()][targetCurrency];
  const assetData = assetDataR.Data;

  console.log("assetDataR", assetDataR);
  console.log("yearData", cryptoCompareData);

  // Derive 7-day and 30-day data from the 365-day data
  const weekData = {
    Data: {
      Data: yearData.Data.Data.slice(-7),
    },
  };
  const monthData = {
    Data: {
      Data: yearData.Data.Data.slice(-30), // Last 30 days data
    },
  };

  // Extracting and formatting chart and market data
  const marketChartValues = {
    day: dayData.Data.Data.map((data) => [data.time, data.close]),
    week: weekData.Data.Data.map((data) => [data.time, data.close]),
    month: monthData.Data.Data.map((data) => [data.time, data.close]),
    year: yearData.Data.Data.map((data) => [data.time, data.close]),
  };

  const marketValues = {
    dayMarketValues: dayData.Data.Data.map((data) => data.close),
    weekMarketValues: weekData.Data.Data.map((data) => data.close),
    monthMarketValues: monthData.Data.Data.map((data) => data.close),
    yearMarketValues: yearData.Data.Data.map((data) => data.close),
  };

  // Extract necessary data points
  const data365 = yearData.Data.Data;
  const data30 = data365.slice(-30);
  const data7 = data365.slice(-7);
  const data1 = data365.slice(-1);

  // Calculate price changes
  const priceChange1d = data1[0].close - data365[data365.length - 2].close;
  const priceChange7d = data7[data7.length - 1].close - data7[0].close;
  const priceChange30d = data30[data30.length - 1].close - data30[0].close;
  const priceChange365d = data365[data365.length - 1].close - data365[0].close;

  // Helper function to determine if a value is falsy or Infinity
  const isInvalid = (value) => !value || !isFinite(value);

  // Calculate percentage changes
  const priceChangePercentage1d =
    (priceChange1d / data365[data365.length - 2].close) * 100;
  const priceChangePercentage7d = (priceChange7d / data7[0].close) * 100;
  const priceChangePercentage30dRaw = (priceChange30d / data30[0].close) * 100;
  const priceChangePercentage365dRaw =
    (priceChange365d / data365[0].close) * 100;

  const priceChangePercentage30d = isInvalid(priceChangePercentage30dRaw)
    ? priceChangePercentage7d
    : priceChangePercentage30dRaw;
  const priceChangePercentage365d = isInvalid(priceChangePercentage365dRaw)
    ? priceChangePercentage30d
    : priceChangePercentage365dRaw;

  console.log("priceChangePercentage7d", priceChangePercentage365d);
  console.log(
    "priceChangePercentage7d",
    (priceChange365d / data365[0].close) * 100,
  );
  console.log("priceChangePercentage7d", priceChangePercentage30d);
  console.log("priceChange365d", priceChange365d);
  console.log("data365[0].close", data365[0].close);

  if (
    !cryptoCompareData ||
    !cryptoCompareData.RAW ||
    !cryptoCompareData.RAW[id.toUpperCase()]
  ) {
    return { notFound: true };
  }

  // Construct the coin information
  const coinAttributes = {
    id,
    symbol: coinData.FROMSYMBOL,
    name: assetData.NAME,
    image: assetData.LOGO_URL,
    description: assetData.ASSET_DESCRIPTION_SUMMARY,
    current_price: coinData.PRICE,
    market_cap: coinData.MKTCAP,
    price_change_1d: priceChange1d,
    price_change_percentage_24h: priceChangePercentage1d,
    price_change_7d: priceChange7d,
    price_change_percentage_7d: priceChangePercentage7d,
    price_change_30d: priceChange30d,
    price_change_percentage_30d: priceChangePercentage30d,
    price_change_365d: priceChange365d,
    price_change_percentage_1y: priceChangePercentage365d,
  };

  const chartValues = {
    labels: marketChartValues?.day.map((data) =>
      new Date(data[0]).toLocaleTimeString(),
    ),
    datasets: [
      {
        label: `${
          coinAttributes.name
        } Price (Past day) in ${targetCurrency.toUpperCase()}`,
        data: marketValues.dayMarketValues,
        type: "line",
        pointRadius: 1.3,
        borderColor: "#ff9500",
      },
    ],
  };

  return {
    coinAttributes,
    marketChartValues,
    marketValues,
    chartValues,
    currencyRates,
  };
}

/**
 * Fetches the necessary data for PopularCoinsList cache initialization based on the specified currency.
 *
 * @async
 * @function
 * @param {string} targetCurrency - The target currency for which data should be fetched.
 * @returns {Promise<Object>} Returns an object containing the coins and currency data.
 * @throws Will return default state objects for coins and currency if there's an error in fetching.
 */
export const getPopularCoinsCacheData = async (targetCurrency) => {
  console.log("getPopularCoinsCacheData", targetCurrency);
  try {
    const { currencyRates, initialHundredCoins, trendingCarouselCoins } =
      await fetchPopularCoinsData(targetCurrency);

    return {
      coins: {
        displayedPopularCoinsList: initialHundredCoins,
        trendingCarouselCoins: trendingCarouselCoins,
        popularCoinsListByCurrency: {
          [targetCurrency]: initialHundredCoins,
        },
      },
      currency: {
        currencyRates: currencyRates,
        currentCurrency: targetCurrency,
        symbol: SYMBOLS_BY_CURRENCIES[targetCurrency],
      },
    };
  } catch (err) {
    console.log(err);
    return {
      coins: initialCoinsState,
      currency: {
        currentCurrency: targetCurrency,
        symbol: SYMBOLS_BY_CURRENCIES[targetCurrency],
      },
    };
  }
};

/**
 * Fetches and prepares the initial props for a coin's details page.
 *
 * @param {Object} context - The Next.js context object.
 * @returns {Object} The initial props to hydrate the page with, including the Redux state.
 */
export async function prepareCoinDetailsPageProps(context) {
  const { id } = context.params;
  const cookies = parse(context.req.headers.cookie || "");
  const currentCurrency =
    cookies.currentCurrency || initialCurrencyState.currentCurrency;
  const usePreloadedData = cookies.usePreloadedData === "true";

  // Reset the "usePreloadedData" cookie for the next navigation
  context.res.setHeader("Set-Cookie", "usePreloadedData=; Max-Age=-1; Path=/;");

  if (usePreloadedData) {
    console.log(
      "Using cached data for coinDetails page! Not returning initialReduxState from server.",
    );
    return { props: {} };
  }

  console.log("Fetching new data for coins page...");
  let initialReduxState;

  try {
    const coinDetails = await fetchCoinDetailsFromCryptoCompare(
      id,
      currentCurrency,
    );
    const {
      coinAttributes,
      marketChartValues,
      marketValues,
      chartValues,
      currencyRates,
    } = coinDetails;

    initialReduxState = {
      coins: {
        selectedCoinDetails: {
          coinAttributes,
          marketChartValues,
          marketValues,
          chartValues,
        },
        selectedCoinDetailsByCurrency: {
          [currentCurrency]: {
            coinAttributes,
            marketChartValues,
            marketValues,
            chartValues,
          },
        },
        cachedCoinDetailsByCurrency: {
          [currentCurrency]: {
            [coinAttributes.symbol.toUpperCase()]: {
              coinAttributes,
              marketChartValues,
              marketValues,
              chartValues,
            },
          },
        },
      },
      currency: {
        currentCurrency,
        symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
        currencyRates: currencyRates,
      },
    };
  } catch (err) {
    // Return a default state if we can't get the data from the API
    console.warn(err);

    initialReduxState = {
      currency: {
        currentCurrency,
        symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
      },
    };
  }

  return {
    props: {
      initialReduxState,
    },
  };
}

/**
 * Fetches and prepares the initial props for the PopularCoinsList page.
 *
 * @param {Object} context - The Next.js context object.
 * @returns {Object} The initial props to hydrate the page with, including the Redux state.
 */
export async function preparePopularCoinsListPageProps(context) {
  // Retrieve cookies
  const currentCurrency =
    context.req.cookies.currentCurrency || initialCurrencyState.currentCurrency;
  const clientGlobalCacheVersion = parseInt(
    context.req.cookies.globalCacheVersion || "0",
  );
  const usePreloadedData = context.req.cookies.usePreloadedData === "true";

  // Retrieve the X-Current-Currency header value. The Service Worker sets this header when the user updates their currency preference. If the page is cached by Vercel, this header helps in busting the cache and ensuring data relevant to the user's current currency is served.
  const incomingCurrency =
    context.req.headers["x-current-currency"] || currentCurrency;
  console.log("x-current-currency", incomingCurrency);
  console.log("currentCurrency cookie", currentCurrency);

  // Calculate the time difference between now and the last globalCacheVersion
  let currentTimestamp = Date.now();
  const timeSinceLastFetch = currentTimestamp - clientGlobalCacheVersion;

  /* Check conditions to determine whether to fetch fresh data or use cached data.
  
  1. If more than five minutes have passed since the last fetch, fetch fresh data. This ensures that the user receives up-to-date cryptocurrency data.
  2. If usePreloadedData is false, this indicates that the client doesn't have recent data preloaded, or the data might be outdated; hence, fetch fresh data.
  3. On Vercel's production environment, the `Vary` header with `X-Current-Currency` ensures that separate cache versions are maintained for different currency preferences. When a user changes their currency, the cache is busted, and `getServerSideProps` runs again, fetching fresh data for the new currency (Or using the cache if available).

  Note: In a local development environment, Vercel's edge caching is not present, so every request will run `getServerSideProps` afresh. Nonetheless, the logic above is still relevant as it ensures that even locally, data remains consistent and is refreshed based on the time since the last fetch and the currency preference.
  */
  let shouldFetchData =
    timeSinceLastFetch >= FIVE_MINUTES_IN_MS || !usePreloadedData;

  let initialReduxState, globalCacheVersion;

  if (shouldFetchData) {
    console.log("Fetching new PopularCoinsLists data on the server");

    try {
      const popularCoinsListData = await getPopularCoinsCacheData(
        incomingCurrency,
      );
      // Update the globalCacheVersion after the fetch has completed
      globalCacheVersion = Date.now().toString();

      initialReduxState = {
        coins: { ...popularCoinsListData.coins },
        currency: { ...popularCoinsListData.currency },
      };

      // Set Cache-Control header to cache the page at the edge (CDN) for 5 minutes.
      // The stale-while-revalidate directive means that stale data can be used while the cache is being revalidated in the background.
      context.res.setHeader(
        "Cache-Control",
        `s-maxage=${FIVE_MINUTES_IN_SECONDS}, stale-while-revalidate`,
      );
    } catch (err) {
      console.log("Error fetching data:", err);

      globalCacheVersion = clientGlobalCacheVersion.toString();

      // Return default data to prevent breaking the site
      initialReduxState = {
        coins: initialCoinsState,
        currency: {
          currentCurrency,
          symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
        },
      };
    }
  } else {
    console.log(
      "Client has a recent globalCacheVersion and data was preloaded. Assuming data is up-to-date.",
    );
  }

  // Clear the usePreloadedData cookie for the next navigation
  context.res.setHeader("Set-Cookie", "usePreloadedData=; Max-Age=-1; Path=/;");

  // Set Vary header on X-Current-Currency & X-Global-Cache-Version. This ensures that if a user changes their currency preference, or fetches new data clientside, the serviceWorker will detect it & add the headersso the cache at the CDN will consider the header and serve the appropriate version of the page or fetch a new one if it doesn't exist.
  context.res.setHeader("Vary", "X-Current-Currency, X-Global-Cache-Version");

  return {
    props: {
      initialReduxState,
      globalCacheVersion,
    },
  };
}
