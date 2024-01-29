import { TCurrencyString } from "@/lib/constants/globalConstants";
import { ICoinDetails, ICoinOverview } from "@/types/coinTypes";

// Specific callback types for each response type
export type CTWCoinDetailsCallback = (
  response: CTWCoinDetailsExternalResponseData,
) => void;
export type CTWAllCoinDetailsCallback = (
  response: CTWAllCoinDetailsExternalResponseData,
) => void;
export type CTWPopularCoinsListCallback = (
  response: CTWPopularCoinsListExternalResponseData,
) => void;
export type CTWAllPopularCoinsListsCallback = (
  response: CTWAllPopularCoinsListsExternalResponseData,
) => void;

export type CTWCallbackResponse =
  | CTWGenericCallbackResponse
  | CTWCoinDetailsExternalResponseData
  | CTWAllCoinDetailsExternalResponseData
  | CTWPopularCoinsListExternalResponseData
  | CTWAllPopularCoinsListsExternalResponseData;

// Generic callback type that uses the request type to determine the correct response data type
export type CTWCallback = (response: CTWCallbackResponse) => void;

export type CTWCallbacksMap = Map<string, CTWCallback>;

type RequestTypeToRequestDataMap = {
  [CTWMessageRequestType.COIN_DETAILS_SINGLE_CURRENCY]: CTWCoinDetailsRequestData;
  [CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES]: CTWAllCoinDetailsRequestData;
  [CTWMessageRequestType.POPULAR_COINS_SINGLE_CURRENCY]: CTWPopularCoinsListRequestData;
  [CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES]: CTWAllPopularCoinsListsRequestData;
};

type RequestTypeToCallbackMap = {
  [CTWMessageRequestType.COIN_DETAILS_SINGLE_CURRENCY]: CTWCoinDetailsCallback;
  [CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES]: CTWAllCoinDetailsCallback;
  [CTWMessageRequestType.POPULAR_COINS_SINGLE_CURRENCY]: CTWPopularCoinsListCallback;
  [CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES]: CTWAllPopularCoinsListsCallback;
};

// REQUEST TYPES
export interface CTWRequestMessage<T extends CTWMessageRequestType> {
  requestType: T;
  requestData: RequestTypeToRequestDataMap[T];
  onComplete?: RequestTypeToCallbackMap[T];
}

/**
 * CTWInternalRequestMessage extends CTWRequestMessage but replaces the onComplete property
 * with onCompleteCallbackId. This ID is used internally to track and handle the callback function
 * associated with the worker's response, ensuring the correct function is executed upon task completion.
 */
export interface CTWInternalRequestMessage
  extends Omit<CTWRequestMessage<CTWMessageRequestType>, "onComplete"> {
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

export type CTWGenericCallbackResponse = {
  responseType: CTWResponseType;
  transformedData: CTWTransformedDataType;
};

export interface CTWCoinDetailsExternalResponseData {
  responseType: CTWResponseType.COIN_DETAILS_SINGLE_CURRENCY;
  transformedData: ICoinDetails;
}

export interface CTWAllCoinDetailsExternalResponseData {
  responseType: CTWResponseType.COIN_DETAILS_ALL_CURRENCIES;
  transformedData: Record<TCurrencyString, ICoinDetails>;
}

export interface CTWPopularCoinsListExternalResponseData {
  responseType: CTWResponseType.POPULAR_COINS_SINGLE_CURRENCY;
  transformedData: ICoinOverview[];
}

export interface CTWAllPopularCoinsListsExternalResponseData {
  responseType: CTWResponseType.POPULAR_COINS_ALL_CURRENCIES;
  transformedData: Record<TCurrencyString, ICoinOverview[]>;
}

// Interfaces for response data to internal message requests (i.e. passing data back to main thread to handle dispatch/onComplete callbacks)
export interface CTWCoinDetailsInternalResponseData
  extends CTWCoinDetailsExternalResponseData {
  onCompleteCallbackId?: string;
  toCurrency: TCurrencyString; // Mandatory for this type
}

export interface CTWAllCoinDetailsInternalResponseData
  extends CTWAllCoinDetailsExternalResponseData {
  onCompleteCallbackId?: string;
}

export interface CTWPopularCoinsListInternalResponseData
  extends CTWPopularCoinsListExternalResponseData {
  onCompleteCallbackId?: string;
  toCurrency: TCurrencyString; // Mandatory for this type
}

export interface CTWAllPopularCoinsListsInternalResponseData
  extends CTWAllPopularCoinsListsExternalResponseData {
  onCompleteCallbackId?: string;
}

// Union type for the transformed data sent from the worker
export type CTWInternalResponseMessageData =
  | CTWCoinDetailsInternalResponseData
  | CTWAllCoinDetailsInternalResponseData
  | CTWPopularCoinsListInternalResponseData
  | CTWAllPopularCoinsListsInternalResponseData;

export type CTWTransformedDataType = CTWInternalResponseMessageData extends {
  transformedData: infer T;
}
  ? T
  : never;

// Extend the MessageEvent interface to include the custom data structure
export interface CTWResponseMessageEvent extends MessageEvent {
  data: CTWInternalResponseMessageData;
}
