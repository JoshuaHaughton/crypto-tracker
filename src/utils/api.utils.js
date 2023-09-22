import { initialCoinsState } from "../store/coins";
import { initialCurrencyState } from "../store/currency";

/**
 * Fetches Top 100 assets, Trending Coins, & Exchange Rate data from CryptoCompare.
 *
 * @returns {Object} An object containing the initial rates, initial hundred coins, and trending carousel coins.
 */
export async function fetchBaseDataFromCryptoCompare() {
  const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: {
      Authorization: `Apikey ${apiKey}`,
    },
  };

  // Fetching all available initialRates from CryptoCompare's price multi-full endpoint for CAD
  const exchangeRateResponse = await fetch(
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=CAD&tsyms=USD,AUD,GBP`,
    fetchOptions,
  );
  const exchangeData = await exchangeRateResponse.json();

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

  // Fetching the top 100 assets by market cap from CryptoCompare in CAD
  const assetsResponse = await fetch(
    "https://min-api.cryptocompare.com/data/top/mktcapfull?limit=100&tsym=CAD",
    fetchOptions,
  );
  const assetsData = await assetsResponse.json();

  const initialHundredCoins = assetsData.Data.map((entry, i) => {
    const coin = entry.CoinInfo;
    const metrics = entry.RAW?.CAD;
    if (!metrics) {
      console.warn(`Metrics not found for coin: ${coin.Name}`);
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
 * Fetches details for a specific coin including its historical data from CryptoCompare.
 *
 * @param {string} id - The coin identifier.
 * @param {string} currency - The target currency for conversions.
 * @returns {Object} An object containing details of the coin and other related data.
 */
export async function fetchCoinDetailsFromCryptoCompare(id, currency = "CAD") {
  const cryptoCompareApiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const cryptoCompareFetchOptions = {
    headers: {
      Authorization: `Apikey ${cryptoCompareApiKey}`,
    },
  };

  const urls = [
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${id.toUpperCase()},CAD&tsyms=USD,AUD,GBP,CAD`,
    `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${id.toUpperCase()}`,
    `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${id}&tsym=${currency}&limit=24`,
    `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${id}&tsym=${currency}&limit=365`,
    `https://api.coinpaprika.com/v1/search?q=${id}`,
  ];

  const [
    cryptoCompareData,
    assetDataR,
    dayData,
    yearData,
    coinPaprikaSearchData,
  ] = await Promise.all(
    urls.map((url) =>
      fetch(url, cryptoCompareFetchOptions).then((res) => res.json()),
    ),
  );

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

  const coinData = cryptoCompareData.RAW[id.toUpperCase()][currency];
  const assetData = assetDataR.Data;

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
  const marketChartFromServer = {
    day: dayData.Data.Data.map((data) => [data.time, data.close]),
    week: weekData.Data.Data.map((data) => [data.time, data.close]),
    month: monthData.Data.Data.map((data) => [data.time, data.close]),
    year: yearData.Data.Data.map((data) => [data.time, data.close]),
  };

  const marketValuesFromServer = {
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

  // Calculate percentage changes
  const priceChangePercentage1d =
    (priceChange1d / data365[data365.length - 2].close) * 100;
  const priceChangePercentage7d = (priceChange7d / data7[0].close) * 100;
  const priceChangePercentage30d = (priceChange30d / data30[0].close) * 100;
  const priceChangePercentage365d = (priceChange365d / data365[0].close) * 100;

  // Verify if the coin exists on Coinpaprika
  if (
    !coinPaprikaSearchData.currencies ||
    coinPaprikaSearchData.currencies.length === 0
  ) {
    throw new Error("Coin not found on Coinpaprika");
  }

  // Fetch ATH from Coinpaprika
  const coinPaprikaId = coinPaprikaSearchData.currencies[0].id;
  const coinPaprikaCoinDetailsResponse = await fetch(
    `https://api.coinpaprika.com/v1/tickers/${coinPaprikaId}`,
  );
  const coinPaprikaCoinDetails = await coinPaprikaCoinDetailsResponse.json();

  // Extract the ATH from Coinpaprika's response
  const cadAthPrice =
    coinPaprikaCoinDetails.quotes.USD.ath_price * initialRates.USD.CAD;

  if (
    !cryptoCompareData ||
    !cryptoCompareData.RAW ||
    !cryptoCompareData.RAW[id.toUpperCase()]
  ) {
    return { notFound: true };
  }

  // Construct the coin information
  const coinInfo = {
    id,
    symbol: coinData.FROMSYMBOL,
    name: assetData.NAME,
    image: assetData.LOGO_URL,
    description: assetData.ASSET_DESCRIPTION_SUMMARY,
    current_price: coinData.PRICE,
    all_time_high: cadAthPrice,
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

  return {
    initialCoin: coinInfo,
    marketChartFromServer,
    marketValuesFromServer,
    chartFromServer: {
      labels: marketChartFromServer?.day.map((data) =>
        new Date(data[0]).toLocaleTimeString(),
      ),
      datasets: [
        {
          label: `${
            coinInfo.name
          } Price (Past day) in ${currency.toUpperCase()}`,
          data: marketValuesFromServer.dayMarketValues,
          type: "line",
          pointRadius: 1.3,
          borderColor: "#ff9500",
        },
      ],
      initialRates,
      initialReduxState: {
        coins: {
          ...initialCoinsState,
          selectedCoinDetails: coinInfo,
          selectedCoinDetailsByCurrency: {
            ...initialCoinsState.selectedCoinDetailsByCurrency,
            [initialCurrencyState.initialCurrency]: coinInfo,
          },
        },
        currency: {
          ...initialCurrencyState,
          currencyRates: initialRates,
        },
      },
    },
  };
}
