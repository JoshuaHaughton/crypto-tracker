import {
  IFormattedPopularCoinsApiResponse,
  IFormattedCoinDetailsAPIResponse,
} from "./apiResponseTypes";

export enum InitialDataType {
  POPULAR_COINS = "popularCoins",
  COIN_DETAILS = "coinDetails",
}

export type TInitialDataOptions =
  | {
      dataType: InitialDataType.POPULAR_COINS;
      data: IFormattedPopularCoinsApiResponse;
    }
  | {
      dataType: InitialDataType.COIN_DETAILS;
      data: IFormattedCoinDetailsAPIResponse;
    }
  | null;
