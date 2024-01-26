import { TCurrencyString } from "@/lib/constants/globalConstants";
import { ICoinDetails, ICoinOverview } from "@/types/coinTypes";

export type CTWCallbackResponse = {
  responseType: CTWResponseType;
  transformedData: CTWTransformedDataType;
};

export type CTWCallBack = (response: CTWCallbackResponse) => void;

export type CTWCallbacksMap = Map<string, CTWCallBack>;

// REQUEST TYPES
export interface CTWRequestMessage {
  requestType: CTWMessageRequestType;
  requestData: CTWMessageRequestData;
  onComplete?: CTWCallBack;
}

/**
 * CTWInternalRequestMessage extends CTWRequestMessage but replaces the onComplete property
 * with onCompleteCallbackId. This ID is used internally to track and handle the callback function
 * associated with the worker's response, ensuring the correct function is executed upon task completion.
 */
export interface CTWInternalRequestMessage
  extends Omit<CTWRequestMessage, "onComplete"> {
  onCompleteCallbackId?: string;
}

export enum CTWMessageRequestType {
  COIN_DETAILS_SINGLE_CURRENCY = "transformCoinDetailsCurrency",
  COIN_DETAILS_ALL_CURRENCIES = "transformAllCoinDetailsCurrencies",
  POPULAR_COINS_SINGLE_CURRENCY = "transformPopularCoinsListCurrency",
  POPULAR_COINS_ALL_CURRENCIES = "transformAllPopularCoinsListCurrencies",
}

// Types for the data object based on each REQUEST case
export interface CTWCoinDetailsRequestData {
  coinToTransform: any;
  fromCurrency: TCurrencyString;
  toCurrency: TCurrencyString;
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
}

export interface CTWAllCoinDetailsRequestData {
  coinToTransform: any;
  fromCurrency: TCurrencyString;
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
  currenciesToExclude?: TCurrencyString[];
}

export interface CTWPopularCoinsListRequestData {
  coinsToTransform: any[];
  fromCurrency: TCurrencyString;
  toCurrency: TCurrencyString;
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
}

export interface CTWAllPopularCoinsListsRequestData {
  coinsToTransform: any[];
  fromCurrency: TCurrencyString;
  currenciesToExclude?: TCurrencyString[];
  currencyExchangeRates: Record<
    TCurrencyString,
    Record<TCurrencyString, number>
  >;
}

export type CTWMessageRequestData =
  | CTWCoinDetailsRequestData
  | CTWAllCoinDetailsRequestData
  | CTWPopularCoinsListRequestData
  | CTWAllPopularCoinsListsRequestData;

// Extend the MessageEvent interface to include the custom data structure
// export interface CTWRRequestMessageEvent extends MessageEvent {
//   data: CTWMessageRequestData;
// }

// Extend the MessageEvent interface to include the custom data structure
export interface CTWInternalRequestMessageEvent extends MessageEvent {
  data: CTWInternalRequestMessage;
}

// RESPONSE TYPES

export enum CTWResponseType {
  COIN_DETAILS_SINGLE_CURRENCY = "TRANSFORMED_COIN_DETAILS",
  COIN_DETAILS_ALL_CURRENCIES = "TRANSFORMED_ALL_COIN_DETAILS",
  POPULAR_COINS_SINGLE_CURRENCY = "TRANSFORMED_POPULAR_COINS_LIST",
  POPULAR_COINS_ALL_CURRENCIES = "TRANSFORMED_ALL_POPULAR_COINS_LIST",
}

// Base interface for common properties of response data
interface CTWBaseResponseData {
  onCompleteCallbackId?: string;
}

// Specific interfaces now extend the base interface with specific types for transformedData
export interface CTWCoinDetailsResponseData extends CTWBaseResponseData {
  responseType: CTWResponseType.COIN_DETAILS_SINGLE_CURRENCY;
  transformedData: ICoinDetails;
  toCurrency: TCurrencyString; // Mandatory for this type
}

export interface CTWAllCoinDetailsResponseData extends CTWBaseResponseData {
  responseType: CTWResponseType.COIN_DETAILS_ALL_CURRENCIES;
  transformedData: Record<TCurrencyString, ICoinDetails>;
}

export interface CTWPopularCoinsListResponseData extends CTWBaseResponseData {
  responseType: CTWResponseType.POPULAR_COINS_SINGLE_CURRENCY;
  transformedData: ICoinOverview[];
  toCurrency: TCurrencyString; // Mandatory for this type
}

export interface CTWAllPopularCoinsListsResponseData
  extends CTWBaseResponseData {
  responseType: CTWResponseType.POPULAR_COINS_ALL_CURRENCIES;
  transformedData: Record<TCurrencyString, ICoinOverview[]>;
}

// Union type for the transformed data sent from the worker
export type CTWResponseMessageData =
  | CTWCoinDetailsResponseData
  | CTWAllCoinDetailsResponseData
  | CTWPopularCoinsListResponseData
  | CTWAllPopularCoinsListsResponseData;

export type CTWTransformedDataType = CTWResponseMessageData extends {
  transformedData: infer T;
}
  ? T
  : never;

// Extend the MessageEvent interface to include the custom data structure
export interface CTWResponseMessageEvent extends MessageEvent {
  data: CTWResponseMessageData;
}
