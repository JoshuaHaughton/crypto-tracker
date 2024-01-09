import {
  ALL_CURRENCIES,
  INITIAL_CURRENCY,
  TCurrencyString,
} from "@/lib/constants";
import { TCurrencyRates } from "@/types/currencyTypes";
import {
  formatCoinOverviewCoin,
  formatCurrencyRates,
} from "@/utils/dataFormat.utils";
import { API_ENDPOINTS } from "../lib/constants/apiConstants";
import {
  IFormattedPopularCoinsApiResponse,
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
  console.warn("fetchPopularCoinsData");

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
    );
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
