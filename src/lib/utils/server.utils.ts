"use server";

import { cookies } from "next/headers";
import {
  COOKIE_ACTIONS,
  COOKIE_ACTION,
  E_COOKIE_NAMES,
} from "@/lib/types/cookieTypes";
import { API_ENDPOINTS } from "../constants/apiConstants";
import { ALL_CURRENCIES, INITIAL_CURRENCY } from "../constants/globalConstants";
import {
  IRawCoinDetailsApiResponse,
  IAssetDataApiResponse,
  IHistoricalDataApiResponse,
  IFormattedCoinDetailsAPIResponse,
  IFormattedPopularCoinsApiResponse,
  IRawPopularCoinsApiResponse,
  ITopMarketCapApiResponse,
} from "../types/apiResponseTypes";
import {
  formatCoinDetailsApiResponse,
  formatPopularCoinsApiResponse,
} from "./dataFormat.utils";

// Define valid SameSite options for type checking
type TSameSiteOptions = "strict" | "lax" | "none";
// IcookieOptions.types.ts
interface ICookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  sameSite?: TSameSiteOptions;
  secure?: boolean;
  httpOnly?: boolean;
}

const defaultCookieOptions: ICookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "strict", // Use the TSameSiteOptions type for strict type checking
};

/**
 * Parameters for the manageCookies function.
 */
interface IManageCookiesParams {
  actionType: COOKIE_ACTION;
  cookieName: E_COOKIE_NAMES;
  cookieValue?: string;
  options?: ICookieOptions;
}

/**
 * Manages cookies by either deleting or updating them based on the specified parameters.
 *
 * @param {IManageCookiesParams} params - The parameters for cookie management.
 * @returns {Promise<void>} A promise that resolves when the cookie has been successfully managed.
 *
 */
export async function manageCookies({
  actionType,
  cookieName,
  cookieValue,
  options = {},
}: IManageCookiesParams): Promise<void> {
  const cookieHandler = cookies();

  if (actionType === COOKIE_ACTIONS.DELETE) {
    cookieHandler.delete(cookieName);
  } else if (actionType === COOKIE_ACTIONS.UPDATE) {
    if (typeof cookieValue === "undefined") {
      throw new Error("Cookie value must be provided for update action");
    }

    // Merge the provided options with default values
    const finalOptions = {
      ...defaultCookieOptions,
      ...options, // User-provided options
    };
    cookieHandler.set(cookieName, cookieValue, finalOptions);
  }
}

interface IFetchOptions {
  useCache?: boolean; // Determines whether to use cache for preloading or to fetch new data
  updateCache?: boolean; // Determines whether to update cache for preloading or to ignore it
  revalidateTime?: number; // Time in seconds for revalidating cached data. Defaults to 30 seconds if useCache is true to ensure fresh data is fetched
}

// 30 seconds
const DEFAULT_REVALIDATION_TIME = 30;
// Revalidates data every 10 minutes since it doesn't need to be as fresh
const EXCHANGE_RATE_REVALIDATION_TIME = 600;

/**
 * Fetches raw data for the top 100 coins and currency exchange rates.
 * This function directly interacts with the API to retrieve raw data.
 *
 * @param {TCurrencyString} targetCurrency - The currency against which market data is compared.
 * @returns {Promise<IRawPopularCoinsApiResponse>} A Promise resolving to an object containing raw currency rates and top 100 market cap coins.
 */
async function fetchRawPopularCoinsData(
  targetCurrency: TCurrencyString,
  options: IFetchOptions = {
    useCache: false,
    updateCache: false,
    revalidateTime: DEFAULT_REVALIDATION_TIME,
  },
): Promise<IRawPopularCoinsApiResponse> {
  // API Key for authorization header
  const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: { Authorization: `Apikey ${apiKey}` },
  };

  // Constructing URLs for concurrent API requests
  const currencyExchangeURL = `${
    API_ENDPOINTS.CURRENCY_EXCHANGE
  }?fsym=${targetCurrency}&tsyms=${ALL_CURRENCIES.join(",")}`;
  const top100MarketCapCoinsURL = `${API_ENDPOINTS.TOP_100_MARKET_CAP_OVERVIEW}?limit=100&tsym=${targetCurrency}`;

  const exchangeRateCacheOptions = options.useCache
    ? { next: { revalidate: EXCHANGE_RATE_REVALIDATION_TIME } }
    : options.updateCache
      ? { cache: "no-cache" as RequestCache }
      : { cache: "no-store" as RequestCache };

  const defaultCacheOptions: RequestInit = options.useCache
    ? {
        next: {
          revalidate: options.revalidateTime || DEFAULT_REVALIDATION_TIME,
        },
      }
    : options.updateCache
      ? { cache: "no-cache" as RequestCache }
      : { cache: "no-store" as RequestCache };

  // Setting up promises for concurrent API requests
  // Revalidates currency exchange data every 600 seconds (10 minutes)
  const exchangeRatePromise = fetch(currencyExchangeURL, {
    ...fetchOptions,
    ...exchangeRateCacheOptions,
  }).then((response) => response.json() as Promise<TCurrencyRates>);

  // Fetching top 100 market cap coins data with an optional cache header
  const top100MarketCapCoinsPromise = fetch(top100MarketCapCoinsURL, {
    ...fetchOptions,
    ...defaultCacheOptions,
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
  options: IFetchOptions = {
    useCache: false,
    updateCache: false,
    revalidateTime: DEFAULT_REVALIDATION_TIME,
  },
): Promise<IFormattedPopularCoinsApiResponse | null> {
  console.log(
    "fetchAndFormatPopularCoinsData: Fetching and formatting popular coins data.",
  );

  try {
    // Fetching raw data from the API
    const rawData: IRawPopularCoinsApiResponse = await fetchRawPopularCoinsData(
      targetCurrency,
      options,
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
 * Fetches and potentially preloads raw data for a specific coin's details and historical data.
 * This adaptable function makes concurrent API calls with configurable caching and revalidation strategies,
 * allowing for optimized data fetching based on the context of use (preloading or direct fetching).
 *
 * @param {string} id - The coin identifier.
 * @param {TCurrencyString} targetCurrency - The target currency for conversions, defaults to INITIAL_CURRENCY.
 * @returns {Promise<IRawCoinDetailsApiResponse>} A Promise resolving to raw API response for coin details.
 */
async function fetchRawCoinDetailsData(
  id: string,
  targetCurrency: TCurrencyString = INITIAL_CURRENCY,
  options: IFetchOptions = {
    useCache: false,
    updateCache: false,
    revalidateTime: DEFAULT_REVALIDATION_TIME,
  },
): Promise<IRawCoinDetailsApiResponse> {
  const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const authHeaders = {
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

  const exchangeRateCacheOptions = options.useCache
    ? { next: { revalidate: EXCHANGE_RATE_REVALIDATION_TIME } }
    : options.updateCache
      ? { cache: "no-cache" as RequestCache }
      : { cache: "no-store" as RequestCache };

  const defaultCacheOptions: RequestInit = options.useCache
    ? {
        next: {
          revalidate: options.revalidateTime || DEFAULT_REVALIDATION_TIME,
        },
      }
    : options.updateCache
      ? { cache: "no-cache" as RequestCache }
      : { cache: "no-store" as RequestCache };

  // Fetching with revalidation logic specific to Next.js 14
  const exchangeRatePromise = fetch(currencyExchangeURL, {
    ...authHeaders,
    ...exchangeRateCacheOptions,
  }).then((res) => res.json() as Promise<TCurrencyRates>);

  const assetDetailsPromise = fetch(assetDetailsURL, {
    ...authHeaders,
    ...defaultCacheOptions,
  }).then((res) => res.json() as Promise<IAssetDataApiResponse>);

  const historical24hPromise = fetch(historical24hURL, {
    ...authHeaders,
    ...defaultCacheOptions,
  }).then((res) => res.json() as Promise<IHistoricalDataApiResponse>);

  const historical365dPromise = fetch(historical365dURL, {
    ...authHeaders,
    ...defaultCacheOptions,
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
  options: IFetchOptions = {
    useCache: false,
    updateCache: false,
    revalidateTime: DEFAULT_REVALIDATION_TIME,
  },
): Promise<IFormattedCoinDetailsAPIResponse> {
  console.log(
    "fetchAndFormatCoinDetailsData: Fetching and formatting coin details data for",
    id,
  );

  try {
    const rawData: IRawCoinDetailsApiResponse = await fetchRawCoinDetailsData(
      id,
      targetCurrency,
      options,
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
    throw error;
  }
}
