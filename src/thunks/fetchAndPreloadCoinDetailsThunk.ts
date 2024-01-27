import { Dispatch, createAsyncThunk } from "@reduxjs/toolkit";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { TRootState } from "@/lib/store";
import { TCurrencyString } from "@/lib/constants/globalConstants";
import { cryptoApiSlice } from "@/lib/reduxApi/apiSlice";
import { preloadCoinDetails } from "./preloadCoinDetailsThunk";
interface IFetchAndPreloadCoinDetailsParams {
  symbol: string;
  targetCurrency: TCurrencyString;
  selectCoinAfterFetch?: boolean;
}

/**
 * Thunk action for asynchronously fetching and preloading coin details, with an option to select the coin afterwards.
 *
 * @remarks
 * This thunk ensures that redundant fetches are avoided if the coin is already being or has been preloaded.
 * It dispatches actions to mark the coin as being fetched, fetches coin details, preloads them into the Redux store,
 * and optionally selects the coin for detailed view.
 *
 * @param params - Object containing the symbol, target currency, and an optional flag to select the coin after fetch.
 * @returns A promise representing the state of the operation.
 */
export const fetchAndPreloadCoinDetailsThunk = createAsyncThunk<
  void,
  IFetchAndPreloadCoinDetailsParams,
  { state: TRootState; dispatch: Dispatch }
>("coins/fetchAndPreloadCoin", async (params, { dispatch, getState }) => {
  const { symbol, targetCurrency, selectCoinAfterFetch } = params;
  const state = getState();
  const { coinsBeingPreloaded } = state.appInfo;
  const coinIsBeingPreloaded = coinsBeingPreloaded[symbol];
  const coinDetailsArePreloaded =
    state.coins.preloadedCoinDetailsByCurrency[targetCurrency]?.[symbol] !=
    null;

  // Avoid fetching if the coin is already being or has been preloaded
  if (coinIsBeingPreloaded || coinDetailsArePreloaded) {
    console.warn(`Coin ${symbol} is already being or has been preloaded.`);
    return;
  }

  try {
    // Mark the coin as being fetched
    dispatch(appInfoActions.addCoinBeingPreloaded({ coinId: symbol }));

    // Fetch coin details using RTK Query's endpoint
    const response = await dispatch(
      cryptoApiSlice.endpoints.fetchCoinDetailsData.initiate({
        id: symbol,
        targetCurrency,
      }),
    ).unwrap();

    // Select the coin for detailed view if requested
    if (selectCoinAfterFetch) {
      dispatch(coinsActions.setSelectedCoinDetails({ coinDetails: response }));
    }

    // Preload the fetched coin details into the Redux store
    dispatch(preloadCoinDetails({ coinDetails: response, coinId: symbol }));
  } catch (error) {
    console.error(
      `Error fetching and preloading coin details for ${symbol}:`,
      error,
    );
    dispatch(appInfoActions.removeCoinBeingPreloaded({ coinId: symbol }));
  }
});
