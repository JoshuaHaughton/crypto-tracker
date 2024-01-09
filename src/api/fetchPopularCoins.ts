import {
  ALL_CURRENCIES,
  INITIAL_CURRENCY,
  TCurrencyString,
} from "@/lib/constants";
import { ICurrencyRates } from "@/types/currencyTypes";
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
  targetCurrency: TCurrencyString = INITIAL_CURRENCY,
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

  const urls = [currencyExchangeURL, top100MarketCapCoinsURL];
  try {
    // Fetch data concurrently using Promise.all and type the responses
    const responses = (await Promise.all(
      urls.map((url) => fetch(url, fetchOptions).then((res) => res.json())),
    )) as [ICurrencyRates, ITopMarketCapApiResponse];

    // Destructure the responses for readability
    const [exchangeData, top100Data] = responses;

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

    const popularCoinsList = top100Data.Data.map((entry, index) =>
      formatCoinOverviewCoin(entry, index, targetCurrency),
    );
    const trendingCarouselCoins = popularCoinsList.slice(0, 10);
    const currencyRates = formatCurrencyRates(exchangeData);

    const formattedData = {
      currencyRates,
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
