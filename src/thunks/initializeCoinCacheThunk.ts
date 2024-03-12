import {
  AnyAction,
  ThunkDispatch,
  UnknownAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { CTWMessageRequestType } from "../../public/webWorkers/currencyTransformer/types";
import { TRootState } from "@/lib/store";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { fetchAndFormatPopularCoinsData } from "@/lib/utils/server.utils";

// Define two separate types for the distinct scenarios.
type TFetchPopularCoins = {
  handleFetch: true;
  popularCoins?: never;
  carouselSymbolList?: never;
};

type TProvidePopularCoins = {
  handleFetch: false;
  popularCoins?: ICoinOverview[];
  carouselSymbolList?: string[];
};

// Combine these types into a single type that accepts either scenario.
type TInitializeCoinCacheParams = TFetchPopularCoins | TProvidePopularCoins;

/**
 * Asynchronously initiates the caching process for popular coins.
 * Checks the provided parameters to determine whether to fetch from the API or use provided data.
 * Updates application state with the latest popular coins information.
 *
 * @param params - Parameters for caching process: either fetch flag or pre-fetched data.
 * @returns A thunk action that can be dispatched.
 */
export const initializeCoinCache = createAsyncThunk<
  void,
  TInitializeCoinCacheParams,
  {
    state: TRootState;
    dispatch: ThunkDispatch<TRootState, void, UnknownAction>;
  }
>("coins/initializeCoinCache", async (params, { dispatch, getState }) => {
  try {
    const { handleFetch, popularCoins, carouselSymbolList } = params;
    const state = getState();
    const { currentCurrency, currencyRates } = state.currency;

    // Mark the completion of initial popular coins loading
    dispatch(appInfoActions.startPopularCoinsPreloading());

    let popularCoinsToUse: ICoinOverview[];
    let carouselSymbolsToUse: string[];

    if (handleFetch) {
      // Fetch popular coins data from the API if handleFetch is true
      console.warn("Fetching popular coins data from API for initialization.");
      const response = await fetchAndFormatPopularCoinsData(currentCurrency, {
        useCache: true,
      });
      popularCoinsToUse = response?.popularCoins ?? [];
      carouselSymbolsToUse = response?.carouselSymbolList ?? [];

      dispatch(
        coinsActions.setCarouselSymbolList({
          carouselSymbols: carouselSymbolsToUse,
        }),
      );
    } else {
      // Use provided popularCoins or carouselSymbolList if available, else use data from state
      console.warn("Using provided/popular coins data for initialization.");
      popularCoinsToUse = popularCoins || state.coins.popularCoins;
      carouselSymbolsToUse =
        carouselSymbolList || state.coins.carouselSymbolList;
    }

    console.warn("popularCoins to use for initializtion", popularCoinsToUse);
    console.warn("currentCurrency to use for initializtion", currentCurrency);

    // Update the Redux store with the initial popular coins data
    dispatch(
      coinsActions.setCachedPopularCoinsMap({
        currency: currentCurrency,
        coinList: popularCoinsToUse,
      }),
    );

    // Sending current Popular Coins data to the web worker for currency transformation
    postMessageToCurrencyTransformerWorker<CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES>(
      {
        requestType: CTWMessageRequestType.POPULAR_COINS_ALL_CURRENCIES,
        requestData: {
          coinsToTransform: popularCoinsToUse,
          fromCurrency: currentCurrency,
          currencyExchangeRates: currencyRates!,
          // We start off with the initial coins for the current currency, so we can exclude it to avoid
          // an unnecessary computation
          currenciesToExclude: [currentCurrency],
        },
        onComplete: () =>
          dispatch(appInfoActions.completePopularCoinsPreloading()),
      },
    );
  } catch (error) {
    console.error("Failed to initialize coin cache:", error);
    // Dispatch failure action
    dispatch(appInfoActions.failPopularCoinsPreloading());
  }
});
