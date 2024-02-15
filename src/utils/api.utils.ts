import {
  formatPopularCoinsApiResponse,
  formatCoinDetailsApiResponse,
} from "@/utils/dataFormat.utils";
import {
  TCurrencyString,
  INITIAL_CURRENCY,
  ALL_CURRENCIES,
} from "../lib/constants/globalConstants";
import { API_ENDPOINTS } from "../lib/constants/apiConstants";
import { TCurrencyRates } from "@/types/currencyTypes";
import {
  IAssetDataApiResponse,
  IFormattedCoinDetailsAPIResponse,
  IFormattedPopularCoinsApiResponse,
  IHistoricalDataApiResponse,
  IRawCoinDetailsApiResponse,
  IRawPopularCoinsApiResponse,
  ITopMarketCapApiResponse,
} from "@/types/apiResponseTypes";
import { TInitialDataOptions, InitialDataType } from "@/types/apiRequestTypes";

/**
 * Fetches raw data for the top 100 coins and currency exchange rates.
 * This function directly interacts with the API to retrieve raw data.
 *
 * @param {TCurrencyString} targetCurrency - The currency against which market data is compared.
 * @returns {Promise<IRawPopularCoinsApiResponse>} A Promise resolving to an object containing raw currency rates and top 100 market cap coins.
 */
async function fetchRawPopularCoinsData(
  targetCurrency: TCurrencyString,
): Promise<IRawPopularCoinsApiResponse> {
  // API Key for authorization header
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: { Authorization: `Apikey ${apiKey}` },
  };

  // Constructing URLs for concurrent API requests
  const currencyExchangeURL = `${
    API_ENDPOINTS.CURRENCY_EXCHANGE
  }?fsym=${targetCurrency}&tsyms=${ALL_CURRENCIES.join(",")}`;
  const top100MarketCapCoinsURL = `${API_ENDPOINTS.TOP_100_MARKET_CAP_OVERVIEW}?limit=100&tsym=${targetCurrency}`;

  // Setting up promises for concurrent API requests
  // Revalidates currency exchange data every 600 seconds (10 minutes)
  const exchangeRatePromise = fetch(currencyExchangeURL, {
    ...fetchOptions,
    next: { revalidate: 600 },
  }).then((response) => response.json() as Promise<TCurrencyRates>);

  // Fetching top 100 market cap coins data with a fresh request every time (no-store)
  const top100MarketCapCoinsPromise = fetch(top100MarketCapCoinsURL, {
    ...fetchOptions,
    cache: "no-store",
  }).then((response) => response.json() as Promise<ITopMarketCapApiResponse>);

  try {
    // Await both promises concurrently and return the raw data
    const [exchangeData, top100MarketCapData] = await Promise.all([
      exchangeRatePromise,
      top100MarketCapCoinsPromise,
    ]);
    return { exchangeData, top100MarketCapData };
  } catch (error) {
    console.error("Error fetching raw popular coins data:", error);
    throw error;
  }
}

/**
 * Fetches and formats the data for the top 100 coins, including trending carousel coins and currency exchange rates.
 * This function first fetches the raw data and then formats it into a more usable structure.
 *
 * @param {TCurrencyString} targetCurrency - The currency against which the market data is compared.
 * @returns {Promise<IFormattedPopularCoinsApiResponse| null>} A Promise resolving to an object containing formatted data including currency rates, popular coins list, and carousel symbols.
 */
export async function fetchAndFormatPopularCoinsData(
  targetCurrency: TCurrencyString,
): Promise<IFormattedPopularCoinsApiResponse | null> {
  console.log(
    "fetchAndFormatPopularCoinsData: Fetching and formatting popular coins data.",
  );

  try {
    // Fetching raw data from the API
    const rawData: IRawPopularCoinsApiResponse = await fetchRawPopularCoinsData(
      targetCurrency,
    );

    // Validating the fetched raw data
    if (!rawData.exchangeData || !rawData.top100MarketCapData) {
      throw new Error(
        "Invalid response from the API endpoint for Popular Coins",
      );
    }

    // Formatting the raw data into a more structured and usable format
    const formattedData: IFormattedPopularCoinsApiResponse =
      formatPopularCoinsApiResponse(rawData, targetCurrency);

    console.log(
      "fetchAndFormatPopularCoinsData: Successfully fetched and formatted popular coins data.",
    );
    return formattedData;
  } catch (error) {
    console.error("Error in fetchAndFormatPopularCoinsData:", error);
    return null;
  }
}

/**
 * Fetches raw data for a specific coin's details and historical data.
 * This function makes concurrent API calls with caching and revalidation strategies.
 *
 * @param {string} id - The coin identifier.
 * @param {TCurrencyString} targetCurrency - The target currency for conversions, defaults to INITIAL_CURRENCY.
 * @returns {Promise<IRawCoinDetailsApiResponse>} A Promise resolving to raw API response for coin details.
 */
async function fetchRawCoinDetailsData(
  id: string,
  targetCurrency: TCurrencyString = INITIAL_CURRENCY,
): Promise<IRawCoinDetailsApiResponse> {
  // API Key for authorization header
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: { Authorization: `Apikey ${apiKey}` },
  };

  // Constructing request URLs
  const currencyExchangeURL = `${
    API_ENDPOINTS.CURRENCY_EXCHANGE
  }?fsym=${targetCurrency}&tsyms=${ALL_CURRENCIES.join(",")}`;
  const assetDetailsURL = `${
    API_ENDPOINTS.ASSET_DETAILS_BY_SYMBOL
  }?asset_symbol=${id.toUpperCase()}&tysm=${targetCurrency}`;
  const historical24hURL = `${API_ENDPOINTS.HISTORICAL_HOUR}?fsym=${id}&tsym=${targetCurrency}&limit=24`;
  const historical365dURL = `${API_ENDPOINTS.HISTORICAL_DAY}?fsym=${id}&tsym=${targetCurrency}&limit=365`;

  // Fetching with revalidation logic specific to Next.js 14
  const exchangeRatePromise = fetch(currencyExchangeURL, {
    ...fetchOptions,
    next: { revalidate: 600 }, // Revalidates data every 10 minutes
  }).then((res) => res.json() as Promise<TCurrencyRates>);

  // Fetching asset details without caching
  const assetDetailsPromise = fetch(assetDetailsURL, {
    ...fetchOptions,
    cache: "no-store",
  }).then((res) => res.json() as Promise<IAssetDataApiResponse>);

  // Fetching historical 24-hr data without caching for the most recent data
  const historical24hPromise = fetch(historical24hURL, {
    ...fetchOptions,
    cache: "no-store",
  }).then((res) => res.json() as Promise<IHistoricalDataApiResponse>);

  // Fetching historical 365-day data without caching for the most recent data
  const historical365dPromise = fetch(historical365dURL, {
    ...fetchOptions,
    cache: "no-store",
  }).then((res) => res.json() as Promise<IHistoricalDataApiResponse>);

  try {
    // Await all promises and structure the response
    const [
      exchangeRateResponse,
      assetDetailsResponse,
      historicalResponse24h,
      historicalResponse365d,
    ] = await Promise.all([
      exchangeRatePromise,
      assetDetailsPromise,
      historical24hPromise,
      historical365dPromise,
    ]);

    // Return structured response
    return {
      exchangeRateResponse,
      assetDetailsResponse,
      historicalResponse24h,
      historicalResponse365d,
    };
  } catch (error) {
    console.error("Error fetching raw coin details data:", error);
    throw error;
  }
}

/**
 * Fetches and formats in-depth details for a specific coin, including its historical data, for the specified currency.
 *
 * @param id - The coin identifier.
 * @param targetCurrency - The target currency for conversions.
 * @returns {Promise<IFormattedCoinDetailsAPIResponse | null>} A promise that resolves to formatted coin details.
 */
export async function fetchAndFormatCoinDetailsData(
  id: string,
  targetCurrency: TCurrencyString = INITIAL_CURRENCY,
): Promise<IFormattedCoinDetailsAPIResponse | null> {
  console.log(
    "fetchAndFormatCoinDetailsData: Fetching and formatting coin details data for",
    id,
  );

  try {
    const rawData: IRawCoinDetailsApiResponse = await fetchRawCoinDetailsData(
      id,
      targetCurrency,
    );
    const formattedData: IFormattedCoinDetailsAPIResponse =
      formatCoinDetailsApiResponse(rawData, targetCurrency);

    console.log(
      "fetchAndFormatCoinDetailsData: Successfully fetched and formatted coin details data for",
      id,
    );
    return formattedData;
  } catch (error) {
    console.error("Error in fetchAndFormatCoinDetailsData:", error);
    return null;
  }
}

// Type guard for IFormattedPopularCoinsApiResponse
export function isPopularCoinsApiResponse(
  data: any,
): data is IFormattedPopularCoinsApiResponse {
  return data && "popularCoins" in data;
}

// Type guard for IFormattedCoinDetailsAPIResponse
export function isCoinDetailsApiResponse(
  data: any,
): data is IFormattedCoinDetailsAPIResponse {
  return data && "coinDetails" in data;
}

export type TInitialRoute = "/" | "/coin";

interface IFetchInitialDataParams {
  initialRoute?: TInitialRoute;
  currencyPreference?: TCurrencyString;
}

/**
 * Fetches initial data based on the route stored in cookies for server-side rendering.
 * This function checks the 'initialRoute' cookie to determine the current page ('home' or 'coin')
 * and fetches corresponding data. It also retrieves the user's currency preference from cookies.
 * This function is designed for server-side initial data loading.
 *
 * @param params - The parameters object containing the initial route and currency preference.
 * @param params.initialRoute - Specifies the route to determine which data to fetch. Defaults to the home page route.
 * @param params.currencyPreference - Specifies the user's preferred currency for formatting data. Defaults to 'USD'.
 * @returns A promise that resolves to the fetched data specific to the route, or null if no matching data can be fetched.
 */
export async function fetchInitialDataBasedOnRoute({
  initialRoute = "/",
  currencyPreference = INITIAL_CURRENCY, // Default currency preference
}: IFetchInitialDataParams): Promise<TInitialDataOptions> {
  // Fetch data based on the route
  switch (initialRoute) {
    case "/":
      console.log("Fetching data for the home page");
      const popularCoinsData = await fetchAndFormatPopularCoinsData(
        currencyPreference,
      );
      return popularCoinsData
        ? { dataType: InitialDataType.POPULAR_COINS, data: popularCoinsData }
        : null;

    case "/coin":
      console.log("Fetching data for a coin details page");
      // Extract symbol from the route
      const symbol = initialRoute.split("/")[2];
      const coinDetailsData = await fetchAndFormatCoinDetailsData(
        symbol,
        currencyPreference,
      );
      return coinDetailsData
        ? { dataType: InitialDataType.COIN_DETAILS, data: coinDetailsData }
        : null;

    default:
      console.log("Unknown route, no data fetched");
      return null;
  }
}
