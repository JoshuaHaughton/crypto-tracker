import { Dispatch, createAsyncThunk } from "@reduxjs/toolkit";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import {
  ICoinDetails,
  ICoinOverview,
  TShallowOrFullCoinDetails,
} from "@/lib/types/coinTypes";
import { currencyActions } from "@/lib/store/currency/currencySlice";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { isEmpty } from "lodash";
import { TRootState } from "@/lib/store";
import {
  CTWCallback,
  CTWCallbackResponse,
  CTWCoinDetailsExternalResponseData,
  CTWCoinDetailsRequestData,
  CTWMessageRequestType,
  CTWPopularCoinsListExternalResponseData,
  CTWPopularCoinsListRequestData,
} from "../../public/webWorkers/currencyTransformer/types";

/**
 * Payload for updating currency.
 */
interface IUpdateCurrencyPayload {
  updatedCurrency: TCurrencyString;
}

// Enum for different types of cache updates
enum E_CACHE_TYPE {
  COIN_DETAILS = "CoinDetails",
  POPULAR_COINS_LIST = "PopularCoinsList",
}

/**
 * Updates the application's current currency setting and handles related data updates and communications.
 * This function manages updates across the application, dispatches necessary actions, sets cookies,
 * and communicates with web workers as needed to ensure currency information is updated everywhere.
 *
 * @param {IUpdateCurrencyPayload} payload - Contains the new currency to set across the application.
 * @param {ThunkAPI} thunkAPI - Provides dispatch and getState methods from Redux Thunk.
 * @returns {Promise<void>} A promise that resolves once all currency-related actions have been dispatched.
 */
export const updateCurrency = createAsyncThunk<
  void,
  IUpdateCurrencyPayload,
  { state: TRootState }
>(
  "currency/updatedCurrency",
  async (payload: IUpdateCurrencyPayload, { dispatch, getState }) => {
    const { updatedCurrency } = payload;
    const { coins, currency } = getState();
    const { currentCurrency, currencyRates } = currency;

    // Early return if currency rates are not available
    if (!currencyRates) {
      console.error(
        "Attempted to update currency without currencyRates available.",
      );
      return;
    }

    await processCoinDataUpdates({
      selectedCoinDetails: coins.selectedCoinDetails,
      cachedSelectedCoinDetailsByCurrency:
        coins.cachedSelectedCoinDetailsByCurrency,
      popularCoins: coins.popularCoins,
      cachedPopularCoinMapsByCurrency: coins.cachedPopularCoinMapsByCurrency,
      updatedCurrency,
      currentCurrency,
      currencyRates,
      dispatch,
    });
  },
);

interface IHandleCacheUsedParams {
  type: E_CACHE_TYPE;
  cache: ICoinOverview[] | ICoinDetails;
  dispatch: Dispatch; // Use specific action type if available
}

/**
 * Handles scenarios where cache is available by dispatching appropriate Redux actions
 * based on the cache type. This function helps in reducing network calls by utilizing
 * cached data to update the UI immediately.
 *
 * @param params - The parameters object:
 * @param params.type - The type of cache being used, which determines the shape of the data and the redux action to dispatch.
 * @param params.cache - The cached data, which can be either a list of coin overviews or coin details, depending on the cache type.
 * @param params.dispatch - The Redux dispatch function used to update the store with the new state.
 */
function handleCacheUsed({
  type,
  cache,
  dispatch,
}: IHandleCacheUsedParams): void {
  switch (type) {
    case E_CACHE_TYPE.COIN_DETAILS:
      const selectedCoinCache = cache as ICoinDetails;
      dispatch(
        coinsActions.setSelectedCoinDetails({ coinDetails: selectedCoinCache }),
      );
      break;
    case E_CACHE_TYPE.POPULAR_COINS_LIST:
      const popularCoinsCache = cache as ICoinOverview[];
      dispatch(coinsActions.setPopularCoins({ coinList: popularCoinsCache }));
      break;
    default:
      console.warn(`Unrecognized cache type: ${type}`);
  }
}

interface IHandleCacheNotUsedParams {
  type: E_CACHE_TYPE;
  coinData: ICoinOverview[] | TShallowOrFullCoinDetails;
  currentCurrency: TCurrencyString;
  updatedCurrency: TCurrencyString;
  currencyRates: TCurrencyExchangeRates;
  dispatch: Dispatch;
}

/**
 * Handles scenarios where no relevant cache is available by preparing and sending
 * request messages for currency updates to the currency transformer worker. This function
 * constructs request messages based on the cache type and sends them to a web worker for processing.
 * It also handles updating the UI immediately once the web worker completes the currency transformation.
 *
 * @param params - The parameters object:
 * @param params.type - The type of cache update needed, which influences the request data structure and the subsequent Redux actions.
 * @param params.coinData - The data of the coins to be transformed, which can vary in structure between detailed coin data and an overview list.
 * @param params.currentCurrency - The currency code before the update, used for converting existing values.
 * @param params.updatedCurrency - The new currency code to update to, used for converting existing values.
 * @param params.currencyRates - The current currency exchange rates, necessary for the conversion process.
 * @param params.dispatch - The Redux dispatch function used to issue actions based on the results of the currency conversion.
 */
function handleCacheNotUsed({
  type,
  coinData,
  currentCurrency,
  updatedCurrency,
  currencyRates,
  dispatch,
}: IHandleCacheNotUsedParams): void {
  // Prepare the request data for currency updates
  const requestData = prepareRequestData(
    type,
    coinData,
    currentCurrency,
    updatedCurrency,
    currencyRates,
    dispatch,
  );
  // Determine the request types for single and all currency updates
  const { singleCurrencyRequestType, allCurrenciesRequestType } =
    getRequestTypes(type);

  // Prepare and send single currency update message so we can get that back asap. The current currency is prioritized before the other ones so we wend them as separate messages
  const singleCurrencyRequestMessage: CTWRequestMessage<
    typeof singleCurrencyRequestType
  > = {
    requestType: singleCurrencyRequestType,
    requestData: requestData.singleRequestData,
    onComplete: requestData.onComplete,
  };
  postMessageToCurrencyTransformerWorker(singleCurrencyRequestMessage);

  // Prepare and send all currencies update message (To get other currency caches ready for future currency updates)
  const allCurrenciesRequestMessage: CTWRequestMessage<
    typeof allCurrenciesRequestType
  > = {
    requestType: allCurrenciesRequestType,
    requestData: requestData.allRequestData,
  };
  postMessageToCurrencyTransformerWorker(allCurrenciesRequestMessage);
}

interface IFormattedUpdateCurrencyRequestData {
  singleRequestData: CTWCoinDetailsRequestData | CTWPopularCoinsListRequestData;
  allRequestData:
    | CTWAllCoinDetailsRequestData
    | CTWAllPopularCoinsListsRequestData;
  onComplete?: CTWCallback;
}

/**
 * Prepares the request data for single and all currency updates based on cache type and coin data.
 * @param {E_CACHE_TYPE} type - The type of cache being updated.
 * @param {ICoinOverview[] | TShallowOrFullCoinDetails} coinData - The data of the coins.
 * @param {TCurrencyString} currentCurrency - The current currency before update.
 * @param {TCurrencyString} updatedCurrency - The new currency to update to.
 * @param {TCurrencyExchangeRates} currencyRates - The current currency exchange rates.
 * @param {Dispatch<any>} dispatch - Redux dispatch function for state management.
 * @returns An object containing the single and all currency request data.
 */
function prepareRequestData(
  type: E_CACHE_TYPE,
  coinData: ICoinOverview[] | TShallowOrFullCoinDetails,
  currentCurrency: TCurrencyString,
  updatedCurrency: TCurrencyString,
  currencyRates: TCurrencyExchangeRates,
  dispatch: Dispatch,
): IFormattedUpdateCurrencyRequestData {
  // Generate common data for both single and all currency updates
  const commonData = {
    fromCurrency: currentCurrency,
    currencyExchangeRates: currencyRates,
  };

  // Prepare specific request data based on the cache type
  if (type === E_CACHE_TYPE.COIN_DETAILS) {
    const singleRequestData: CTWCoinDetailsRequestData = {
      ...commonData,
      coinToTransform: coinData as ICoinDetails,
      toCurrency: updatedCurrency,
    };
    const allRequestData: CTWAllCoinDetailsRequestData = {
      ...commonData,
      coinToTransform: coinData as ICoinDetails,
    };

    // Encapsulate 'onComplete' within the request data structure for handling web worker responses
    const onComplete = (response: CTWCallbackResponse) => {
      const { transformedData } = response;

      const transformedCoinDetails =
        transformedData as CTWCoinDetailsExternalResponseData["transformedData"];
      dispatch(
        coinsActions.setSelectedCoinDetails({
          coinDetails: transformedCoinDetails,
        }),
      );

      // Update currency state once transformation is complete
      dispatch(
        currencyActions.setDisplayedCurrency({ currency: updatedCurrency }),
      );
    };
    return { singleRequestData, allRequestData, onComplete };
  } else {
    const singleRequestData: CTWPopularCoinsListRequestData = {
      ...commonData,
      coinsToTransform: coinData as ICoinOverview[],
      toCurrency: updatedCurrency,
    };
    const allRequestData: CTWAllPopularCoinsListsRequestData = {
      ...commonData,
      coinsToTransform: coinData as ICoinOverview[],
    };

    // Encapsulate 'onComplete' within the request data structure for handling web worker responses
    const onComplete = (response: CTWCallbackResponse) => {
      const { transformedData } = response;

      const transformedPopularCoins =
        transformedData as CTWPopularCoinsListExternalResponseData["transformedData"];
      dispatch(
        coinsActions.setPopularCoins({ coinList: transformedPopularCoins }),
      );

      // Update currency state once transformation is complete
      dispatch(
        currencyActions.setDisplayedCurrency({ currency: updatedCurrency }),
      );
    };
    return { singleRequestData, allRequestData, onComplete };
  }
}

interface IGetRequestTypeResponse {
  singleCurrencyRequestType: CTWMessageRequestType;
  allCurrenciesRequestType: CTWMessageRequestType;
}

/**
 * Determines the request types based on the cache type for updating single and all currencies.
 * This function maps each cache type to its corresponding single and all currency request types,
 * facilitating the dynamic selection of request types based on cache type during runtime.
 *
 * @param {E_CACHE_TYPE} type - The type of cache being updated, determining which set of request types to return.
 * @returns {IGetRequestTypeResponse} An object containing the request types for single and all currency updates specific to the cache type.
 */
function getRequestTypes(type: E_CACHE_TYPE): IGetRequestTypeResponse {
  switch (type) {
    case E_CACHE_TYPE.COIN_DETAILS:
      return {
        singleCurrencyRequestType:
          CTWMessageRequestType.COIN_DETAILS_SINGLE_CURRENCY,
        allCurrenciesRequestType:
          CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES,
      };
    case E_CACHE_TYPE.POPULAR_COINS_LIST:
      return {
        singleCurrencyRequestType:
          CTWMessageRequestType.POPULAR_COINS_SINGLE_CURRENCY,
        allCurrenciesRequestType:
          CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES,
      };
    default:
      throw new Error("Unsupported cache type");
  }
}

interface IProcessCoinDataUpdatesParams {
  selectedCoinDetails: TShallowOrFullCoinDetails | null;
  cachedSelectedCoinDetailsByCurrency: Record<
    TCurrencyString,
    TShallowOrFullCoinDetails | null
  >;
  popularCoins: ICoinOverview[];
  cachedPopularCoinMapsByCurrency: Record<
    TCurrencyString,
    Record<string, ICoinOverview>
  >;
  currentCurrency: TCurrencyString;
  updatedCurrency: TCurrencyString;
  currencyRates: TCurrencyExchangeRates;
  dispatch: Dispatch;
}

/**
 * Updates the process for coin data, integrating directly with updateCurrencyAndCache.
 * This approach optimizes performance by utilizing available cache or requesting new updates.
 *
 * @param params - Parameters for processing coin data updates:
 * @param params.selectedCoinDetails - Details of the selected coin.
 * @param params.cachedSelectedCoinDetailsByCurrency - Cached coin details by currency.
 * @param params.popularCoins - List of popular coins.
 * @param params.cachedPopularCoinMapsByCurrency - Cached popular coins by currency.
 * @param params.updatedCurrency - The new currency to update to.
 */
async function processCoinDataUpdates({
  selectedCoinDetails,
  cachedSelectedCoinDetailsByCurrency,
  popularCoins,
  cachedPopularCoinMapsByCurrency,
  currentCurrency,
  updatedCurrency,
  currencyRates,
  dispatch,
}: IProcessCoinDataUpdatesParams): Promise<void> {
  // Update for selected coin details if necessary
  const coinIsSelected = selectedCoinDetails != null;
  if (coinIsSelected) {
    const selectedCoinCache = cachedSelectedCoinDetailsByCurrency[
      updatedCurrency
    ] as ICoinDetails;
    await updateCurrencyAndCache({
      type: E_CACHE_TYPE.COIN_DETAILS,
      coinData: selectedCoinDetails,
      cache: selectedCoinCache,
      currentCurrency,
      updatedCurrency,
      currencyRates,
      dispatch,
    });
  }

  // Update for popular coins list
  if (popularCoins.length > 0) {
    const popularCoinsCache = Object.values(
      cachedPopularCoinMapsByCurrency[updatedCurrency] || {},
    );
    await updateCurrencyAndCache({
      type: E_CACHE_TYPE.POPULAR_COINS_LIST,
      coinData: popularCoins,
      cache: popularCoinsCache,
      currentCurrency,
      updatedCurrency,
      currencyRates,
      dispatch,
    });
  }
}

interface IUpdateCurrencyAndCacheParams {
  type: E_CACHE_TYPE;
  coinData: ICoinOverview[] | TShallowOrFullCoinDetails;
  cache: ICoinOverview[] | ICoinDetails;
  dispatch: Dispatch<any>;
  updatedCurrency: TCurrencyString;
  currentCurrency: TCurrencyString;
  currencyRates: TCurrencyExchangeRates;
}

/**
 * Function to update currency and cache based on provided type and data.
 * This function decides whether to use the cache or request new data based on the current state.
 * It updates the relevant coin details or popular coins list based on the cache availability.
 *
 * @param params - Object containing parameters for the update:
 * @param params.type - The type of cache to update (coin details or popular coins list).
 * @param params.coinData - The coin data to use for the update.
 * @param params.cache - The current cache data.
 * @param params.dispatch - The Redux dispatch function.
 * @param params.updatedCurrency - The currency to update to.
 * @param params.currentCurrency - The current currency before the update.
 * @param params.currencyRates - The current currency exchange rates.
 * @returns A promise resolved once the update is completed.
 */
async function updateCurrencyAndCache({
  type,
  coinData,
  cache,
  updatedCurrency,
  currentCurrency,
  currencyRates,
  dispatch,
}: IUpdateCurrencyAndCacheParams): Promise<void> {
  if (cache && !isEmpty(cache)) {
    // Use the cache to update the state immediately without fetching new data
    console.log(`CACHE USED - ${type}`);
    console.log(`CACHE -`, cache);
    console.log(`CURRENT COINDATA -`, coinData);
    handleCacheUsed({ type, cache, dispatch });
    // For the situation where the cache isnt used, we dispatch after the CTW job is complete by passing it an onCompleteCallback
    dispatch(
      currencyActions.setDisplayedCurrency({ currency: updatedCurrency }),
    );
  } else {
    // No relevant cache available, request new data
    console.log(`CACHE NOT USED - ${type}`);
    handleCacheNotUsed({
      type,
      coinData,
      currentCurrency,
      updatedCurrency,
      currencyRates,
      dispatch,
    });
  }
}
