import { TCurrencyString } from "@/lib/constants/globalConstants";

// Transform Request types
export enum CTWRequestType {
  TRANSFORM_COIN_DETAILS_CURRENCY = "transformCoinDetailsCurrency",
  TRANSFORM_ALL_COIN_DETAILS_CURRENCIES = "transformAllCoinDetailsCurrencies",
  TRANSFORM_POPULAR_COINS_LIST_CURRENCY = "transformPopularCoinsListCurrency",
  TRANSFORM_ALL_POPULAR_COINS_LIST_CURRENCIES = "transformAllPopularCoinsListCurrencies",
}

// Transform Response Types
export enum CTWResponseType {
  TRANSFORMED_COIN_DETAILS = "TRANSFORMED_COIN_DETAILS",
  TRANSFORMED_ALL_COIN_DETAILS = "TRANSFORMED_ALL_COIN_DETAILS",
  TRANSFORMED_POPULAR_COINS_LIST = "TRANSFORMED_POPULAR_COINS_LIST",
  TRANSFORMED_ALL_POPULAR_COINS_LIST = "TRANSFORMED_ALL_POPULAR_COINS_LIST",
}

// Types for the data object based on each case
export interface TransformCoinDetailsCurrencyData {
  coinToTransform: any;
  fromCurrency: TCurrencyString;
  toCurrency: TCurrencyString;
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
}

export interface TransformAllCoinDetailsCurrenciesData {
  coinToTransform: any;
  fromCurrency: TCurrencyString;
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
  currenciesToExclude?: TCurrencyString[];
}

export interface TransformPopularCoinsListCurrencyData {
  coinsToTransform: any[];
  fromCurrency: TCurrencyString;
  toCurrency: TCurrencyString;
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
}

export interface TransformAllPopularCoinsListCurrenciesData {
  coinsToTransform: any[];
  fromCurrency: TCurrencyString;
  currenciesToExclude?: TCurrencyString[];
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
}

// Union type for the data object
export type CTWRequestData =
  | TransformCoinDetailsCurrencyData
  | TransformAllCoinDetailsCurrenciesData
  | TransformPopularCoinsListCurrencyData
  | TransformAllPopularCoinsListCurrenciesData;

export interface CTWRequestMessage {
  requestType: CTWRequestType;
  requestData: CTWRequestData;
  toCurrency: TCurrencyString;
}
