import {
  TCurrencyString,
  TCurrencySymbol,
} from "@/lib/constants/globalConstants";

// Popular Coins
export interface ICoinOverview {
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  total_market_cap: number;
  market_cap_rank: number;
  volume_24h: number;
  price_change_percentage_24h: number;
}

export interface IDisplayedCoinOverview
  // We format larger numbers to make them cleaner to display
  extends Omit<
    ICoinOverview,
    | "total_market_cap"
    | "volume_24h"
    | "current_price"
    | "price_change_percentage_24h"
  > {
  total_market_cap: string;
  volume_24h: string;
  current_price: string;
  price_change_percentage_24h: string;
  currentCurrencySymbol: TCurrencySymbol;
}

/**
 * Represents indices for multiple match details within a string.
 * This array stores pairs of numbers, each pair consisting of a start index and an end index for a match.
 * The array should be interpreted as [(start1, end1), (start2, end2), ...] meaning that
 * indices 0 and 1 form the first pair, indices 2 and 3 form the second pair, and so on.
 * However, TypeScript does not enforce the structure beyond it being an array of numbers.
 */
export type IMatchDetail = number[]; // Interpreted as pairs of [start, end].

/**
 * Represents detailed match information for a coin's name or symbol in search results.
 * Contains arrays of match details for name and symbol respectively, indicating the
 * segments that matched the search query.
 */
export interface IPopularCoinMatchDetails {
  /**
   * Match details for the coin's name. Each entry defines a substring range that matched
   * the search query.
   */
  nameMatches: IMatchDetail | null;

  /**
   * Match details for the coin's symbol. Each entry defines a substring range that matched
   * the search query.
   */
  symbolMatches: IMatchDetail | null;
}

/**
 * Represents a coin item which might also include details about search matches.
 * This structure is versatile, accommodating both regular coin listings and enhanced
 * search results where parts of the coin's information match a search query.
 */
export interface IPopularCoinSearchItem {
  /**
   * Basic details about the coin, consistent across all items.
   */
  coinDetails: ICoinOverview;

  /**
   * Optional match details for search results. This property is populated when the
   * item is a result of a search operation, detailing the segments of the coin's name and symbol
   * that matched the search criteria. It's omitted for regular listings where search
   * context is not applicable.
   */
  matchDetails?: IPopularCoinMatchDetails;
}

// Coin Details

export interface ICoinDetails {
  id: string;
  currency: TCurrencyString;
  coinAttributes: ICoinDetailAttributes;
  timeSeriesPriceData: ITimeSeriesPriceData;
  priceTrendData: IPriceTrendData;
  priceChartDataset: IPriceChartDataset;
}

export interface ICoinDetailAttributes extends ICoinOverview {
  description: string;
  website_url: string;
  launch_date: number;
  total_supply: number;
  price_change_24h: number;
  price_change_7d: number;
  price_change_30d: number;
  price_change_365d: number;
  // price_change_percentage_24h is inherited from ICoinOverview
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  price_change_percentage_1y: number;
}

// Coin Details - Historical Data

export enum EChartPeriodInterval {
  H24 = "h24",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

/**
 * Represents the different time periods for chart data.
 */
export type TChartPeriodKey = "h24" | "week" | "month" | "year";

export interface ITimeSeriesPriceData {
  h24: Array<[number, number]>;
  week: Array<[number, number]>;
  month: Array<[number, number]>;
  year: Array<[number, number]>;
}

export interface IPriceTrendData {
  h24MarketValues: number[];
  weekMarketValues: number[];
  monthMarketValues: number[];
  yearMarketValues: number[];
}

export interface IPriceChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    type: string;
    pointRadius: number;
    borderColor: string;
  }[];
}

export interface IPeriodicPriceChanges {
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  priceChange365d: number;
}

export interface IPeriodicPriceChangePercentages {
  h24: number;
  d7: number;
  d30: number;
  d365: number;
}

/**
 * Represents the shallow details of a coin, usually sourced from popular coins data.
 * This type includes the 'coinAttributes' property, which must be present and conform to either
 * `ICoinOverview` or `ICoinDetailAttributes`. All other properties from `ICoinDetails` are optional
 * and when not provided, they are expected to be `undefined`. This approach is used to indicate
 * that these properties are not part of the shallow data representation.
 */
export type TShallowCoinDetails = {
  // Mark all properties from ICoinDetails, except for 'coinAttributes', as potentially undefined.
  [P in keyof Omit<ICoinDetails, "coinAttributes" | "id">]?: undefined;
} & {
  // Ensure 'coinAttributes' is always present and adheres to specified types.
  coinAttributes: ICoinOverview | ICoinDetailAttributes;
  id: string;
};

// Union type combining full coin details with the shallow coin details.
export type TShallowOrFullCoinDetails = ICoinDetails | TShallowCoinDetails;
