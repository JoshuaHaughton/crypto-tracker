import { TAppDispatch, TRootState } from "@/lib/store";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { ICoinDetails } from "@/lib/types/coinTypes";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { CTWMessageRequestType } from "../../public/webWorkers/currencyTransformer/types";
import apiSlice from "@/lib/store/api/apiSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";

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
  const { coinsBeingPreloaded } = state.appInfo;
  const { preloadedCoinDetailsByCurrency } = state.coins;

  // Determine parameters based on the provided action type
  // Based on the scenario, we then declare our variables and provide default values as needed.
  const isFetchingScenario = "handleFetch" in params && params.handleFetch;
  let handleFetch = isFetchingScenario;
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
  const isBeingPreloaded = !!coinsBeingPreloaded[coinSymbol];
  const isAlreadyPreloaded =
    !!preloadedCoinDetailsByCurrency[currentCurrency]?.[coinSymbol]
      ?.priceChartDataset;

  if (!currencyRates || isAlreadyPreloaded || isBeingPreloaded) {
    const errorCheck = !currencyRates
      ? "noCurrencyRates"
      : isAlreadyPreloaded
      ? "alreadyPreloaded"
      : isBeingPreloaded
      ? "currentlyPreloading"
      : null; // No issues, proceed normally.

    // Handle different error scenarios with a switch case for debugging in dev
    switch (errorCheck) {
      case "noCurrencyRates":
        console.error(
          `Currency Rates are not available for preloading coin details. Please reload the app. Coin Symbol: ${coinSymbol}`,
        );
        return;
      case "alreadyPreloaded":
        console.error(
          `Coin details for ${coinSymbol} have already been preloaded. Returning.`,
        );
        return;
      case "currentlyPreloading":
        console.error(
          `Coin details for ${coinSymbol} are currently being preloaded. Please wait.`,
        );
        return;
    }

    return;
  }

  dispatch(appInfoActions.addCoinBeingPreloaded({ coinId: coinSymbol }));

  if (handleFetch && currentCurrency) {
    try {
      const fetchedDetails = await dispatch(
        apiSlice.endpoints.fetchCoinDetailsData.initiate({
          symbol: symbolToFetch,
          targetCurrency: currentCurrency,
        }),
      ).unwrap();
      detailsToPreload = fetchedDetails.coinDetails;
      coinSymbol = detailsToPreload.id;
    } catch (error) {
      console.error(`Error fetching coin details for ${symbolToFetch}:`, error);
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
      coinsActions.setSelectedCoinDetails({ coinDetails: detailsToPreload }),
    );
  }

  // Proceed with the preloading process.
  // Dispatch an action to set the preloaded coin details in the store.
  dispatch(
    coinsActions.setPreloadedCoinDetailsUsingPopularCoinsBase({
      coinDetails: detailsToPreload,
      currency: currentCurrency, // The currency in which the details are preloaded.
    }),
  );

  // Post a message to the web worker to start preloading the coin details for all available currencies.
  // postMessageToCurrencyTransformerWorker({
  //   requestType: CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES,
  //   requestData: {
  //     coinToTransform: detailsToPreload, // The coin details to transform.
  //     fromCurrency: currentCurrency, // The base currency for the transformation.
  //     currencyExchangeRates: currencyRates, // The current currency exchange rates.
  //   },
  //   onComplete: () => {
  //     // Once preloading is complete, remove the coin from the preloading list.
  //     dispatch(appInfoActions.removeCoinBeingPreloaded({ coinId: coinSymbol }));
  //     // Log a message indicating that preloading has completed for this coin.
  //     console.log(`Preloading completed for coin: ${coinSymbol}`);
  //   },
  // });
});
