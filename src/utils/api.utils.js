import { parse } from "cookie";
import { SYMBOLS_BY_CURRENCIES } from "../global/constants";
import { initialCoinsState } from "../store/coins";
import { initialCurrencyState } from "../store/currency";

/**
 * Fetches Top 100 assets, Trending Coins, & Exchange Rate data from CryptoCompare for the specified currency.
 *
 * @param {string} targetCurrency - The target currency for which data should be fetched.
 * @returns {Object} An object containing the initial rates, initial hundred coins, and trending carousel coins.
 */
export async function fetchBaseDataFromCryptoCompare(
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

  const initialRates = {
    CAD: {
      CAD: 1,
      USD: exchangeData.RAW.CAD.USD.PRICE,
      AUD: exchangeData.RAW.CAD.AUD.PRICE,
      GBP: exchangeData.RAW.CAD.GBP.PRICE,
    },
    USD: {
      CAD: 1 / exchangeData.RAW.CAD.USD.PRICE,
      USD: 1,
      AUD: exchangeData.RAW.CAD.AUD.PRICE / exchangeData.RAW.CAD.USD.PRICE,
      GBP: exchangeData.RAW.CAD.GBP.PRICE / exchangeData.RAW.CAD.USD.PRICE,
    },
    AUD: {
      CAD: 1 / exchangeData.RAW.CAD.AUD.PRICE,
      USD: exchangeData.RAW.CAD.USD.PRICE / exchangeData.RAW.CAD.AUD.PRICE,
      AUD: 1,
      GBP: exchangeData.RAW.CAD.GBP.PRICE / exchangeData.RAW.CAD.AUD.PRICE,
    },
    GBP: {
      CAD: 1 / exchangeData.RAW.CAD.GBP.PRICE,
      USD: exchangeData.RAW.CAD.USD.PRICE / exchangeData.RAW.CAD.GBP.PRICE,
      AUD: exchangeData.RAW.CAD.AUD.PRICE / exchangeData.RAW.CAD.GBP.PRICE,
      GBP: 1,
    },
  };

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
    initialRates,
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

  const initialRates = {
    CAD: {
      CAD: 1,
      USD: cryptoCompareData.RAW.CAD.USD.PRICE,
      AUD: cryptoCompareData.RAW.CAD.AUD.PRICE,
      GBP: cryptoCompareData.RAW.CAD.GBP.PRICE,
    },
    USD: {
      CAD: 1 / cryptoCompareData.RAW.CAD.USD.PRICE,
      USD: 1,
      AUD:
        cryptoCompareData.RAW.CAD.AUD.PRICE /
        cryptoCompareData.RAW.CAD.USD.PRICE,
      GBP:
        cryptoCompareData.RAW.CAD.GBP.PRICE /
        cryptoCompareData.RAW.CAD.USD.PRICE,
    },
    AUD: {
      CAD: 1 / cryptoCompareData.RAW.CAD.AUD.PRICE,
      USD:
        cryptoCompareData.RAW.CAD.USD.PRICE /
        cryptoCompareData.RAW.CAD.AUD.PRICE,
      AUD: 1,
      GBP:
        cryptoCompareData.RAW.CAD.GBP.PRICE /
        cryptoCompareData.RAW.CAD.AUD.PRICE,
    },
    GBP: {
      CAD: 1 / cryptoCompareData.RAW.CAD.GBP.PRICE,
      USD:
        cryptoCompareData.RAW.CAD.USD.PRICE /
        cryptoCompareData.RAW.CAD.GBP.PRICE,
      AUD:
        cryptoCompareData.RAW.CAD.AUD.PRICE /
        cryptoCompareData.RAW.CAD.GBP.PRICE,
      GBP: 1,
    },
  };

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
    initialRates,
  };
}

/**
 * Asynchronously fetches the necessary data for PopularCoinsList cache initialization based on the specified currency.
 *
 * @async
 * @function
 * @param {string} targetCurrency - The target currency for which data should be fetched.
 * @returns {Promise<Object>} Returns an object containing the coins and currency data.
 * @throws Will return default state objects for coins and currency if there's an error in fetching.
 */
export const fetchDataForPopularCoinsListCacheInitialization = async (
  targetCurrency,
) => {
  console.log(
    "fetchDataForPopularCoinsListCacheInitialization",
    targetCurrency,
  );
  try {
    const { initialRates, initialHundredCoins, trendingCarouselCoins } =
      await fetchBaseDataFromCryptoCompare(targetCurrency);

    return {
      coins: {
        displayedPopularCoinsList: initialHundredCoins,
        trendingCarouselCoins: trendingCarouselCoins,
        popularCoinsListByCurrency: {
          [targetCurrency]: initialHundredCoins,
        },
      },
      currency: {
        currencyRates: initialRates,
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
 * @returns {Object} The initial props to hydrate the application with, including the Redux state.
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
      initialRates,
    } = coinDetails;

    return {
      props: {
        initialReduxState: {
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
            currencyRates: initialRates,
          },
        },
      },
    };
  } catch (err) {
    console.warn(err);
    return {
      props: {
        initialReduxState: {
          currency: {
            currentCurrency,
            symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
          },
        },
      },
    };
  }
}
