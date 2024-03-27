import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import {
  INITIAL_CURRENCY,
  TCurrencyString,
} from "../constants/globalConstants";
import {
  TInitialPopularCoinsData,
  TInitialPageDataOptions,
  InitialDataType,
  TInitialCoinDetailsData,
} from "../types/apiRequestTypes";
import { E_COOKIE_NAMES } from "../types/cookieTypes";
import {
  fetchAndFormatPopularCoinsData,
  fetchAndFormatCoinDetailsData,
} from "./server.utils";
import { ICoinDetails, ICoinOverview } from "@/lib/types/coinTypes";

export interface IInitialAppData {
  currencyPreference: TCurrencyString;
}

/**
 * Fetches initial data required for the application's root layout based on cookies.
 * This can include user preferences, settings, or any other initial data required globally.
 *
 * @param cookieStore - The cookie store object from which to retrieve data.
 */
export function getInitialData(
  cookieStore: ReadonlyRequestCookies,
): IInitialAppData {
  console.warn("Fetching initial data for layout");

  // Retrieve currency preference from cookies or use default
  const currencyPreference: TCurrencyString =
    (cookieStore.get(E_COOKIE_NAMES.CURRENT_CURRENCY)
      ?.value as TCurrencyString) || INITIAL_CURRENCY;

  // Return the fetched initial data
  return {
    currencyPreference,
  };
}

interface IInitialHomePageData {
  popularCoins: ICoinOverview[];
  popularCoinsMap: Record<string, ICoinOverview>;
  carouselSymbolList: string[];
}

export interface IHomePageInitialDataType {
  dateForGlobalStore: TInitialPopularCoinsData;
  initialPageData: IInitialHomePageData;
}

/**
 * Fetches initial page data required for rendering the HomePage component.
 * This function retrieves user preferences from cookies, fetches popular coins data based on the currency,
 * and formats the data for use by the HomePage component and StoreHydrator.
 *
 * @returns An object containing the initial page data or a JSX element for error handling.
 */
export async function getHomePageInitialData(
  cookieStore: ReadonlyRequestCookies,
): Promise<IHomePageInitialDataType | null> {
  // Retrieve currency preference from cookies or use default
  const currencyPreference: TCurrencyString =
    (cookieStore.get(E_COOKIE_NAMES.CURRENT_CURRENCY)
      ?.value as TCurrencyString) || INITIAL_CURRENCY;

  console.log(`Currency Preference set to: ${currencyPreference}`);

  // Fetch popular coins data based on the user's currency preference
  console.warn("Fetching popular coins data");
  const popularCoinsResponseData =
    await fetchAndFormatPopularCoinsData(currencyPreference);

  // Ensure the response data contains popular coins before proceeding
  if (!popularCoinsResponseData?.popularCoins) {
    // Log and return placeholder if no popular coins are available
    console.error("No popular coins data available");
    return null;
  }

  console.log(
    `Fetched ${popularCoinsResponseData.popularCoins.length} popular coins`,
  );

  // Format the initial data for the StoreHydrator
  const dateForGlobalStore: TInitialPageDataOptions = {
    dataType: InitialDataType.POPULAR_COINS,
    data: popularCoinsResponseData,
    currentCurrency: currencyPreference,
  };

  // Prepare page data for the HomePage component. This will be what we show before hydration, and should be the same values
  const initialPageData = {
    popularCoins: popularCoinsResponseData.popularCoins,
    popularCoinsMap: popularCoinsResponseData.popularCoins.reduce(
      (acc, coin) => {
        acc[coin.symbol] = coin;
        return acc;
      },
      {} as Record<string, ICoinOverview>,
    ),
    carouselSymbolList: popularCoinsResponseData.carouselSymbolList,
    currencyExchangeRates: popularCoinsResponseData.currencyExchangeRates,
  };

  console.log(
    `Page data prepared with ${initialPageData.popularCoins.length} coins`,
  );

  // Return the formatted initial data and page data for rendering
  return {
    dateForGlobalStore,
    initialPageData,
  };
}

export interface IInitialCoinDetailsPageData {
  selectedCoinDetails: ICoinDetails;
  currencyExchangeRates: TCurrencyExchangeRates;
}

export interface ICoinDetailsPageInitialDataType {
  dateForGlobalStore: TInitialCoinDetailsData;
  initialPageData: IInitialCoinDetailsPageData;
}

/**
 * Fetches initial page data required for rendering the HomePage component.
 * This function retrieves user preferences from cookies, fetches popular coins data based on the currency,
 * and formats the data for use by the HomePage component and StoreHydrator.
 *
 * @returns An object containing the initial page data or a JSX element for error handling.
 */
export async function getCoinDetailsPageInitialData(
  cookieStore: ReadonlyRequestCookies,
  symbol: string,
): Promise<ICoinDetailsPageInitialDataType> {
  // Retrieve currency preference from cookies or use default
  const currencyPreference: TCurrencyString =
    (cookieStore.get(E_COOKIE_NAMES.CURRENT_CURRENCY)
      ?.value as TCurrencyString) || INITIAL_CURRENCY;

  // Fetch popular coins data based on the user's currency preference
  console.warn("Fetching Coin Details data");
  const coinDetailsResponseData = await fetchAndFormatCoinDetailsData(
    symbol,
    currencyPreference,
    { useCache: true },
  );

  // Format the initial data for the StoreHydrator
  const dateForGlobalStore: TInitialCoinDetailsData = {
    dataType: InitialDataType.COIN_DETAILS,
    data: coinDetailsResponseData,
    currentCurrency: currencyPreference,
  };

  // Prepare page data for the HomePage component. This will be what we show before hydration, and should be the same values
  const initialPageData: IInitialCoinDetailsPageData = {
    selectedCoinDetails: coinDetailsResponseData.coinDetails,
    currencyExchangeRates: coinDetailsResponseData.currencyExchangeRates,
  };
  console.log("initialPageData", initialPageData);

  // Return the formatted initial data and page data for rendering
  return {
    dateForGlobalStore,
    initialPageData,
  };
}
