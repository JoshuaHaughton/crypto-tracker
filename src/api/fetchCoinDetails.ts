import { ICoinDetails } from "@/types/coinTypes";
import {
  formatCoinDetailsFromApiResponse,
  formatCurrencyRates,
} from "@/utils/dataFormat.utils";
import {
  TCurrencyString,
  INITIAL_CURRENCY,
  ALL_CURRENCIES,
} from "../lib/constants";
import { API_ENDPOINTS } from "../lib/constants/apiConstants";
import { ICurrencyRates, TCurrencyExchangeRates } from "@/types/currencyTypes";
import {
  IAssetDataApiResponse,
  IFormattedCoinDetailsAPIResponse,
  IHistoricalDataApiResponse,
} from "@/types/apiResponseTypes";

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

  const urls = [
    currencyExchangeURL,
    assetDetailsURL,
    historical24hURL,
    historical365dURL,
  ];

  try {
    // Fetch data concurrently using Promise.all and type the responses
    const [
      exchangeRateResponse,
      assetDetailsResponse,
      historicalResponse24h,
      historicalResponse365d,
    ] = (await Promise.all(
      urls.map((url) =>
        fetch(url, cryptoCompareFetchOptions).then((res) => res.json()),
      ),
    )) as [
      ICurrencyRates,
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
    const currencyRates: TCurrencyExchangeRates =
      formatCurrencyRates(exchangeRateResponse);

    // Format the fetched data
    const formattedCoinDetails: ICoinDetails = formatCoinDetailsFromApiResponse(
      id,
      targetCurrency,
      currencyRates,
      assetDetailsResponse,
      historicalResponse24h,
      historicalResponse365d,
    );

    // Format the response
    const formattedResponse: IFormattedCoinDetailsAPIResponse = {
      coinDetails: formattedCoinDetails,
      currencyRates,
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
