import {
  IFormattedPopularCoinsApiResponse,
  IFormattedCoinDetailsAPIResponse,
} from "./apiResponseTypes";

export type TInitialRoute = "/" | "/coin";

export enum InitialDataType {
  POPULAR_COINS = "popularCoins",
  COIN_DETAILS = "coinDetails",
}

export type TInitialPopularCoinsData = {
  dataType: InitialDataType.POPULAR_COINS;
  data: IFormattedPopularCoinsApiResponse;
};

export type TInitialCoinDetailsData = {
  dataType: InitialDataType.COIN_DETAILS;
  data: IFormattedCoinDetailsAPIResponse;
};

export type TInitialPageDataOptions =
  | TInitialPopularCoinsData
  | TInitialCoinDetailsData
  | undefined;

export type TInitialReduxDataOptions = { currencyPreference: TCurrencyString };

/**
 * Constants for loading statuses within the application.
 * This utilizes a readonly Record to ensure type safety and immutability.
 */
export const LoadingStatus = {
  IDLE: "idle",
  LOADING: "loading",
  LOADED: "loaded",
  FAILED: "failed",
  PRELOADING: "preloading",
  PRELOADED: "preloaded",
} as const;

/**
 * Type definition for loading status values, derived from the LoadingStatus constant.
 */
export type TLoadingStatus = (typeof LoadingStatus)[keyof typeof LoadingStatus];

/**
 * Type definition specifically for initial popular coins loading status.
 */
export type TInitialPopularCoinsStatus = Extract<
  TLoadingStatus,
  "idle" | "loading" | "loaded" | "failed"
>;

/**
 * Type definition specifically for preloaded popular coins status.
 */
export type TPreloadedPopularCoinsStatus = Extract<
  TLoadingStatus,
  "idle" | "preloading" | "preloaded" | "failed"
>;
