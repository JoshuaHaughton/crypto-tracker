import { ICoinDetails } from "@/types/coinTypes";
import {
  formatCoinDetailsFromApiResponse,
  formatCoinOverviewCoin,
  formatCurrencyRates,
} from "@/utils/dataFormat.utils";
import {
  TCurrencyString,
  INITIAL_CURRENCY,
  ALL_CURRENCIES,
} from "../lib/constants/globalConstants";
import { API_ENDPOINTS } from "../lib/constants/apiConstants";
import { TCurrencyRates, TCurrencyExchangeRates } from "@/types/currencyTypes";
import {
  IAssetDataApiResponse,
  IFormattedCoinDetailsAPIResponse,
  IFormattedPopularCoinsApiResponse,
  IHistoricalDataApiResponse,
  ITopMarketCapApiResponse,
} from "@/types/apiResponseTypes";

/**
 * Fetches and formats the top 100 coins, trending coins, and currency exchange rate data.
 * @param targetCurrency - The currency against which market data is compared.
 * @returns Promise resolving to an object containing currency rates, popular coins list, and trending carousel coins.
 */
export async function fetchPopularCoinsData(
  targetCurrency: TCurrencyString,
): Promise<IFormattedPopularCoinsApiResponse> {
  console.warn("fetchPopularCoinsData!!!");

  // Construct the headers for the API request
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: {
      Authorization: `Apikey ${apiKey}`,
    },
  };

  // Constructing an array of URLs for concurrent fetching
  const currencyExchangeURL = `${
    API_ENDPOINTS.CURRENCY_EXCHANGE
  }?fsym=${targetCurrency}&tsyms=${ALL_CURRENCIES.join(",")}`;
  const top100MarketCapCoinsURL = `${API_ENDPOINTS.TOP_100_MARKET_CAP_OVERVIEW}?limit=100&tsym=${targetCurrency}`;

  // Modify the fetch call for the currency exchange URL to use caching. Unlike Crypto Prices, these values don't change often
  const exchangeRatePromise = fetch(currencyExchangeURL, {
    ...fetchOptions,
    next: { revalidate: 600 }, // Revalidates every 10 mins
  }).then((res) => res.json());

  // Fetch the top 100 market cap coins dynamically every time
  const top100MarketCapCoinsPromise = fetch(top100MarketCapCoinsURL, {
    ...fetchOptions,
    cache: "no-store", // Ensures fresh data on each request
  }).then((res) => res.json());

  try {
    // Fetch data concurrently using Promise.all and type the responses
    const [exchangeData, top100Data] = (await Promise.all([
      exchangeRatePromise,
      top100MarketCapCoinsPromise,
    ])) as [TCurrencyRates, ITopMarketCapApiResponse];

    // Validate the responses
    if (!exchangeData || !top100Data) {
      console.error(
        "Invalid response from the CryptoCompare API endpoint for Popular Coins",
      );
      throw new Error(
        "Invalid response from the CryptoCompare API endpoint for Popular Coins",
      );
    }

    // Processing and formatting the fetched data
    const currencyExchangeRates = formatCurrencyRates(exchangeData);
    const popularCoinsList = top100Data.Data.map((entry, index) =>
      formatCoinOverviewCoin(entry, index, targetCurrency),
    ).filter(Boolean);
    const trendingCarouselCoins = popularCoinsList.slice(0, 10);

    const formattedData = {
      currencyExchangeRates,
      popularCoinsList,
      trendingCarouselCoins,
    };

    console.warn("fetchPopularCoinsData successful!");
    return formattedData;
  } catch (error) {
    // Logging and rethrowing errors for upstream handling
    console.error("Error fetching data:", error);
    throw error;
  }
}

/**
 * Fetches in-depth details for a specific coin, including its historical data, for the specified currency.
 * @param id - The coin identifier.
 * @param targetCurrency - The target currency for conversions.
 * @returns A promise that resolves to an object containing details of the coin and other related data.
 */
export async function fetchCoinDetailsData(
  id: string,
  targetCurrency: TCurrencyString = INITIAL_CURRENCY,
): Promise<IFormattedCoinDetailsAPIResponse | null> {
  // Logging for debugging purposes
  console.warn("fetchCoinDetailsData", id);

  // API Key for CryptoCompare API
  const cryptoCompareApiKey = process.env.CRYPTOCOMPARE_API_KEY;

  // Fetch options including the authorization header
  const cryptoCompareFetchOptions = {
    headers: {
      Authorization: `Apikey ${cryptoCompareApiKey}`,
    },
  };

  // Constructing URLs using constants
  const currencyExchangeURL = `${
    API_ENDPOINTS.CURRENCY_EXCHANGE
  }?fsym=${targetCurrency}&tsyms=${ALL_CURRENCIES.join(",")}`;
  const assetDetailsURL = `${
    API_ENDPOINTS.ASSET_DETAILS_BY_SYMBOL
  }?asset_symbol=${id.toUpperCase()}`;
  const historical24hURL = `${API_ENDPOINTS.HISTORICAL_HOUR}?fsym=${id}&tsym=${targetCurrency}&limit=24`;
  const historical365dURL = `${API_ENDPOINTS.HISTORICAL_DAY}?fsym=${id}&tsym=${targetCurrency}&limit=365`;

  // Modify the fetch call for the currency exchange URL to use caching. Unlike Crypto Prices, these values don't change often
  const exchangeRatePromise = fetch(currencyExchangeURL, {
    ...cryptoCompareFetchOptions,
    next: { revalidate: 600 }, // Revalidates every 10 mins
  }).then((res) => res.json());

  // URLs for the requests without caching
  const dynamicRequests = [
    assetDetailsURL,
    historical24hURL,
    historical365dURL,
  ];

  // Create an array of promises for the other URLs
  const otherPromises = dynamicRequests.map((url) =>
    fetch(url, { ...cryptoCompareFetchOptions, cache: "no-store" }).then(
      (res) => res.json(),
    ),
  );

  try {
    // Fetch data concurrently using Promise.all and type the responses
    const [
      exchangeRateResponse,
      assetDetailsResponse,
      historicalResponse24h,
      historicalResponse365d,
    ] = (await Promise.all([exchangeRatePromise, ...otherPromises])) as [
      TCurrencyRates,
      IAssetDataApiResponse,
      IHistoricalDataApiResponse,
      IHistoricalDataApiResponse,
    ];

    // Validate responses before proceeding with data processing
    if (
      !exchangeRateResponse ||
      !assetDetailsResponse ||
      !historicalResponse24h ||
      !historicalResponse365d
    ) {
      console.error(
        "Invalid response from the CryptoCompare API endpoint for Asset Details",
      );
      throw new Error(
        "Invalid response from the CryptoCompare API endpoint for Asset Details",
      );
    }

    // Extract the currency rates
    const currencyExchangeRates: TCurrencyExchangeRates =
      formatCurrencyRates(exchangeRateResponse);

    // Format the fetched data
    const formattedCoinDetails: ICoinDetails = formatCoinDetailsFromApiResponse(
      id,
      targetCurrency,
      currencyExchangeRates,
      assetDetailsResponse,
      historicalResponse24h,
      historicalResponse365d,
    );

    // Format the response
    const formattedResponse: IFormattedCoinDetailsAPIResponse = {
      coinDetails: formattedCoinDetails,
      currencyExchangeRates,
    };

    // Logging successful data fetch
    console.warn("fetchCoinDetailsData successful!", id);
    return formattedResponse;
  } catch (err) {
    // Logging and handling errors
    console.error("Error fetching data - fetchCoinDetailsData", err);
    return null;
  }
}
