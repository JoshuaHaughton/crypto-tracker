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
} from "../types/apiResponseTypes";
import { formatCoinDetailsApiResponse } from "./dataFormat.utils";

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
  useCache: boolean; // Determines whether to use cache for preloading or to fetch new data
  revalidateTime?: number; // Time in seconds for revalidating cached data. Defaults to 30 seconds if useCache is true to ensure fresh data is fetched
}

// 30 seconds
const DEFAULT_REVALIDATION_TIME = 30;

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

  // Fetching with revalidation logic specific to Next.js 14
  const exchangeRatePromise = fetch(currencyExchangeURL, {
    ...authHeaders,
    next: { revalidate: 600 }, // Revalidates data every 10 minutes since it doesn't need to be as fresh
  }).then((res) => res.json() as Promise<TCurrencyRates>);

  const cacheOptions: RequestInit = options.useCache
    ? {
        cache: "force-cache" as RequestCache,
        next: {
          revalidate: options.revalidateTime || DEFAULT_REVALIDATION_TIME,
        },
      }
    : { cache: "no-store" as RequestCache };

  const assetDetailsPromise = fetch(assetDetailsURL, {
    ...authHeaders,
    ...cacheOptions,
  }).then((res) => res.json() as Promise<IAssetDataApiResponse>);

  const historical24hPromise = fetch(historical24hURL, {
    ...authHeaders,
    ...cacheOptions,
  }).then((res) => res.json() as Promise<IHistoricalDataApiResponse>);

  const historical365dPromise = fetch(historical365dURL, {
    ...authHeaders,
    ...cacheOptions,
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
    revalidateTime: DEFAULT_REVALIDATION_TIME,
  },
): Promise<IFormattedCoinDetailsAPIResponse | null> {
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
    return null;
  }
}
