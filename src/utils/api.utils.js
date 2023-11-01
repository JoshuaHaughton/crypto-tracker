import { parse } from "cookie";
import {
  FIVE_MINUTES_IN_MS,
  FIVE_MINUTES_IN_SECONDS,
  SYMBOLS_BY_CURRENCIES,
} from "../global/constants";
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
    const coinDetails = await fetchCoinDetailsData(id, currentCurrency);
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
