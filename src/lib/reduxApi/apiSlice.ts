import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TCurrencyString } from "../constants/globalConstants";
import {
  BASE_URL_CRYPTO_COMPARE,
  API_ENDPOINTS,
} from "../constants/apiConstants";
import {
  IFormattedPopularCoinsApiResponse,
  IFormattedCoinDetailsAPIResponse,
  IRawPopularCoinsApiResponse,
  IRawCoinDetailsApiResponse,
} from "@/lib/types/apiResponseTypes";
import {
  formatCoinDetailsApiResponse,
  formatPopularCoinsApiResponse,
} from "@/lib/utils/dataFormat.utils";

/**
 * This API slice is responsible for managing and providing access to data-fetching endpoints.
 */
export const cryptoApiSlice = createApi({
  /**
   * Set up the base query with fetchBaseQuery.
   * This function is a simple wrapper around the standard fetch API and is used to define the base part of our API requests.
   */
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL_CRYPTO_COMPARE }),

  /**
   * Defines the API endpoints.
   * Each endpoint corresponds to a specific network request and is used to fetch data from the server.
   */
  endpoints: (builder) => ({
    /**
     * Endpoint for fetching popular coins data.
     * @param builder.query - Function that receives a query argument (targetCurrency) and returns a query definition.
     */
    fetchPopularCoinsData: builder.query<
      IFormattedPopularCoinsApiResponse,
      TCurrencyString
    >({
      /**
       * Define the query function for the endpoint.
       * This function constructs the request details.
       * @param targetCurrency - The currency against which market data is compared.
       * @returns The query definition including the URL and HTTP method.
       */
      query: (targetCurrency) => ({
        url: `${API_ENDPOINTS.TOP_100_MARKET_CAP_OVERVIEW}?limit=100&tsym=${targetCurrency}`,
        method: "GET",
      }),
      /**
       * Transforms the raw response to a formatted response.
       * @param response - The raw response data from the API.
       * @param error - The error object, if any occurred during fetching.
       * @param targetCurrency - The currency against which market data is compared.
       * @returns The formatted response data.
       */
      transformResponse: (
        response: IRawPopularCoinsApiResponse,
        error: unknown,
        targetCurrency: TCurrencyString,
      ): IFormattedPopularCoinsApiResponse => {
        if (error) throw error;
        return formatPopularCoinsApiResponse(response, targetCurrency);
      },
    }),

    /**
     * Endpoint for fetching coin details data.
     * This endpoint is used to get in-depth details for a specific coin.
     * @param builder.query - Function that receives a query argument (id, targetCurrency) and returns a query definition.
     */
    fetchCoinDetailsData: builder.query<
      IFormattedCoinDetailsAPIResponse,
      { symbol: string; targetCurrency: TCurrencyString }
    >({
      /**
       * Define the query function for fetching coin details.
       * This function specifies the request URL and method to retrieve data for a specific coin.
       * @param symbol - The id symbol for the coin.
       * @param targetCurrency - The target currency for conversion rates.
       * @returns The query definition for fetching coin details.
       */
      query: ({ symbol, targetCurrency }) => ({
        url: `${
          API_ENDPOINTS.ASSET_DETAILS_BY_SYMBOL
        }?asset_symbol=${symbol.toUpperCase()}&tysm=${targetCurrency}`,
        method: "GET",
      }),
      /**
       * Transforms the raw response to a formatted response.
       * @param response - The raw response data from the API.
       * @param error - The error object, if any occurred during fetching.
       * @param params - The parameters including the coin symbol and target currency.
       * @returns The formatted response data.
       */
      transformResponse: (
        response: IRawCoinDetailsApiResponse,
        error: unknown,
        { targetCurrency }: { symbol: string; targetCurrency: TCurrencyString },
      ): IFormattedCoinDetailsAPIResponse => {
        if (error) throw error;
        return formatCoinDetailsApiResponse(response, targetCurrency);
      },
    }),
  }),
});

/**
 * Export hooks generated by RTK Query for interacting with the API endpoints.
 * These hooks are used within React components to make API calls and manage data-fetching state.
 */
export const { useFetchPopularCoinsDataQuery, useFetchCoinDetailsDataQuery } =
  cryptoApiSlice;
