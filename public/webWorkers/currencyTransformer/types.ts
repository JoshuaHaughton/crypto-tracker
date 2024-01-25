import { TCurrencyString } from "@/lib/constants/globalConstants";
import { ICoinDetails, ICoinOverview } from "@/types/coinTypes";

export type TCallBack = () => void;

export type CTWCallbacksMap = Map<string, TCallBack>;

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

export interface CTWRequestMessageData {
  requestType: CTWRequestType;
  requestData: CTWRequestData;
}

// Extend the MessageEvent interface to include the custom data structure
export interface CTWRequestMessageEvent extends MessageEvent {
  data: CTWRequestMessageData;
}

/**
 * Interface representing the internal structure of a currency transformer worker request message.
 * This extends the public request message format by including a callbackId,
 * which is used internally to associate the message with a specific callback function.
 *
 * The callbackId is generated and added internally when a request is made to the worker.
 * This mechanism allows for the execution of a specific callback function once the worker
 * task associated with the message is completed, thereby enabling immediate and context-specific
 * reactions to the worker's task completion.
 */
export interface CTWInternalRequestMessage extends CTWRequestMessageData {
  callbackId?: string;
}

// RESPONSE TYPES
export interface TransformedCoinDetails {
  responseType: CTWResponseType.TRANSFORMED_COIN_DETAILS;
  transformedData: ICoinDetails;
  toCurrency: TCurrencyString;
  callbackId?: string;
}

export interface TransformedAllCoinDetails {
  responseType: CTWResponseType.TRANSFORMED_ALL_COIN_DETAILS;
  transformedData: Record<TCurrencyString, ICoinDetails>;
  callbackId?: string;
}

export interface TransformedPopularCoinsList {
  responseType: CTWResponseType.TRANSFORMED_POPULAR_COINS_LIST;
  transformedData: ICoinOverview[];
  toCurrency: TCurrencyString;
  callbackId?: string;
}

export interface TransformedAllPopularCoinsList {
  responseType: CTWResponseType.TRANSFORMED_ALL_POPULAR_COINS_LIST;
  transformedData: Record<TCurrencyString, ICoinOverview[]>;
  callbackId?: string;
}

// Union type for the transformed data sent from the worker
type CTWWorkerResponseMessageData =
  | TransformedCoinDetails
  | TransformedAllCoinDetails
  | TransformedPopularCoinsList
  | TransformedAllPopularCoinsList;

// Extend the MessageEvent interface to include the custom data structure
export interface CTWResponseMessageEvent extends MessageEvent {
  data: CTWWorkerResponseMessageData;
}
