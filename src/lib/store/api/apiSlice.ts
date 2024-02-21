import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TCurrencyString } from "../../constants/globalConstants";
import {
  BASE_URL_CRYPTO_COMPARE,
  API_ENDPOINTS,
} from "../../constants/apiConstants";
import {
  IFormattedPopularCoinsApiResponse,
  IFormattedCoinDetailsAPIResponse,
  IRawPopularCoinsApiResponse,
} from "@/lib/types/apiResponseTypes";
import { formatPopularCoinsApiResponse } from "@/lib/utils/dataFormat.utils";
import { fetchAndFormatCoinDetailsData } from "@/lib/utils/api.utils";

/**
 * This API slice is responsible for managing and providing access to data-fetching endpoints.
 */
const cryptoApiSlice = createApi({
  /**
   * Set up the base query with fetchBaseQuery.
   * This function is a simple wrapper around the standard fetch API and is used to define the base part of our API requests.
   */
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL_CRYPTO_COMPARE,
    prepareHeaders: (headers) => {
      // Existing logic to retrieve API key
      const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
      // If the API key exists, set the Authorization header
      if (apiKey) {
        headers.set("Authorization", `Apikey ${apiKey}`);
      }
      return headers;
    },
  }),

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
        if (error) {
          console.error(error);
          throw error;
        }
        return formatPopularCoinsApiResponse(response, targetCurrency);
      },
    }),

    /**
     * Endpoint for fetching and formatting detailed information about a specific coin.
     * Utilizes a custom `queryFn` to handle fetching and formatting.
     *
     * @param {Object} args - Arguments containing symbol and target currency.
     * @param {string} args.symbol - The symbol representing the cryptocurrency.
     * @param {TCurrencyString} args.targetCurrency - The target currency for price conversion.
     * @param {BaseQueryApi} queryApi - The API provided by RTK Query for executing additional queries or getting state.
     * @param {Object} extraOptions - Extra options provided to the query function.
     * @param {BaseQueryFn} baseQuery - The base query function provided by RTK Query for standard fetching.
     * @returns {Promise<QueryReturnValue<IFormattedCoinDetailsAPIResponse, FetchBaseQueryError>>} - The formatted coin details or an error object.
     */
    fetchCoinDetailsData: builder.query<
      IFormattedCoinDetailsAPIResponse,
      { symbol: string; targetCurrency: TCurrencyString }
    >({
      queryFn: async ({ symbol, targetCurrency }) => {
        try {
          // Attempt to fetch and format the coin details data
          const formattedData = await fetchAndFormatCoinDetailsData(
            symbol,
            targetCurrency,
          );
          if (!formattedData) {
            // If no data could be formatted, return an API error
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Failed to fetch or format data.",
              },
            };
          }
          // Return the successfully formatted data
          return { data: formattedData };
        } catch (error) {
          // Log and return any errors encountered during the fetch/format process
          console.error(`Error in fetchAndFormatCoinDetailsData: ${error}`);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "An unknown error occurred",
            },
          };
        }
      },
    }),
  }),
});

/**
 * Export hooks generated by RTK Query for interacting with the API endpoints.
 * These hooks are used within React components to make API calls and manage data-fetching state.
 */
export const {
  useFetchPopularCoinsDataQuery,
  useFetchCoinDetailsDataQuery,
  reducer: apiReducer,
  middleware: apiMiddleware,
} = cryptoApiSlice;

export default cryptoApiSlice;
