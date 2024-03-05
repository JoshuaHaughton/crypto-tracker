import { TRootState } from "@/lib/store";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { ICoinDetails } from "@/lib/types/coinTypes";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAndFormatCoinDetailsData } from "@/lib/utils/server.utils";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { CTWMessageRequestType } from "../../public/webWorkers/currencyTransformer/types";

/**
 * Exclusive parameters for fetching coin details. If provided, `handleFetch` must be true,
 * and `symbolToFetch` must be specified. `selectCoinAfterFetch` is optional.
 */
interface IFetchAndPreloadCoinDetailsParams {
  handleFetch: true;
  symbolToFetch: string;
  selectCoinAfterFetch?: boolean;
}

/**
 * Exclusive parameters for preloading existing coin details without fetching.
 * `detailsToPreload` must be specified.
 */
interface IPreloadExistingCoinDetailsParams {
  detailsToPreload: ICoinDetails;
  handleFetch?: false;
}

/**
 * Type that combines the exclusive parameter sets for the thunk action.
 * A user must provide either fetch parameters or preload parameters, not both.
 */
type IPreloadCoinDetailsParams =
  | IFetchAndPreloadCoinDetailsParams
  | IPreloadExistingCoinDetailsParams;

/**
 * Asynchronous thunk action to preload a coin's details.
 * Handles fetching coin details if required and then preloading them into the store.
 *
 * @param params - Parameters including coin details, symbol, target currency,
 *                 and flags for fetching and selection post-fetch.
 * @returns A thunk action that manages the preloading of coin details.
 */
export const preloadCoinDetailsThunk = createAsyncThunk<
  void,
  IPreloadCoinDetailsParams,
  { state: TRootState }
>("coins/preloadCoinDetails", async (params, { dispatch, getState }) => {
  const state = getState();
  const { currentCurrency, currencyRates } = state.currency;

  // Determine parameters based on the provided action type
  // Based on the scenario, we then declare our variables and provide default values as needed.
  const isFetchingScenario = "handleFetch" in params && params.handleFetch;
  let symbolToFetch: string | undefined;
  let selectCoinAfterFetch = false; // Default value for optional property
  let detailsToPreload: ICoinDetails | undefined;

  // Assign values based on the type of operation. We ensure symbolToFetch gets a value only when appropriate.
  if (isFetchingScenario) {
    // In the fetching scenario, we assert params as IFetchAndPreloadCoinDetailsParams to satisfy TypeScript's type checking.
    const fetchParams = params as IFetchAndPreloadCoinDetailsParams;
    symbolToFetch = fetchParams.symbolToFetch; // Now it's guaranteed to be available.
    selectCoinAfterFetch = fetchParams.selectCoinAfterFetch ?? false; // Use existing value or default to false.
  } else {
    // In the preloading scenario, we assert params as IPreloadExistingCoinDetailsParams.
    const preloadParams = params as IPreloadExistingCoinDetailsParams;
    detailsToPreload = preloadParams.detailsToPreload;
    symbolToFetch = detailsToPreload.id; // We take the id from the preloaded details.
  }

  let coinSymbol = symbolToFetch;

  if (!currencyRates) {
    return;
  }

  dispatch(appInfoActions.addCoinBeingPreloaded({ coinId: coinSymbol }));
  console.warn(`Preloading started for coin: ${coinSymbol}`);

  if (isFetchingScenario) {
    try {
      const fetchedDetails = await fetchAndFormatCoinDetailsData(
        coinSymbol,
        currentCurrency,
      );
      detailsToPreload = fetchedDetails?.coinDetails;
    } catch (error) {
      console.error(`Error fetching coin details for ${coinSymbol}:`, error);
      dispatch(appInfoActions.removeCoinBeingPreloaded({ coinId: coinSymbol }));
      return;
    }
  }
  // Check if there are details available for the coin to be preloaded.
  if (!detailsToPreload) {
    console.warn(`No details available to preload for coin: ${coinSymbol}`);
    return; // Exit the function as there's nothing to preload.
  }

  // If specified, select the coin details after fetching them, updating the state accordingly.
  if (selectCoinAfterFetch) {
    dispatch(
      coinsActions.setSelectedCoinDetails({
        coinDetails: detailsToPreload,
      }),
    );
  }

  dispatch(
    coinsActions.setPreloadedCoinForCurrency({
      coinDetails: detailsToPreload,
      currency: currentCurrency,
    }),
  );

  // Sending current Popular Coins data to the web worker for currency transformation
  postMessageToCurrencyTransformerWorker<CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES>(
    {
      requestType: CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES,
      requestData: {
        coinToTransform: detailsToPreload,
        fromCurrency: currentCurrency,
        currencyExchangeRates: currencyRates,
        // We start off with the initial details for the current currency, so we can exclude it to avoid
        // an unnecessary computation
        currenciesToExclude: [currentCurrency],
      },
      onComplete: () =>
        dispatch(
          appInfoActions.removeCoinBeingPreloaded({ coinId: coinSymbol }),
        ),
    },
  );
});
