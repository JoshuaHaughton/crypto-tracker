import { TAppDispatch, TRootState } from "@/lib/store";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { ICoinDetails } from "@/types/coinTypes";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { CTWMessageRequestType } from "../../public/webWorkers/currencyTransformer/types";
import { TCurrencyString } from "@/lib/constants/globalConstants";
import { cryptoApiSlice } from "@/lib/reduxApi/apiSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Parameters for preloading coin details.
 * Includes optional details for fetching and a flag to select the coin after fetching.
 */
interface IPreloadCoinDetailsParams {
  handleFetch?: boolean;
  symbolToFetch?: string;
  selectCoinAfterFetch?: boolean;
  coinDetailsToPreload?: ICoinDetails;
}

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
>(
  "coins/preloadCoinDetails",
  async (
    {
      handleFetch = false,
      symbolToFetch,
      selectCoinAfterFetch,
      coinDetailsToPreload,
    }: IPreloadCoinDetailsParams,
    { dispatch, getState },
  ) => {
    const state = getState();
    const { currentCurrency, currencyRates } = state.currency;
    const { coinsBeingPreloaded } = state.appInfo;
    const { preloadedCoinDetailsByCurrency } = state.coins;
    let detailsToPreload = coinDetailsToPreload;
    let coinSymbol = symbolToFetch || coinDetailsToPreload!.id; // Using the non-null assertion operator to assert that coinSymbol will not be null or undefined.
    const isBeingPreloaded = coinsBeingPreloaded[coinSymbol] != null;
    const isAlreadyPreloaded =
      preloadedCoinDetailsByCurrency[currentCurrency][coinSymbol]
        .priceChartDataset != null;

    // Error checks
    if (!currencyRates || isAlreadyPreloaded) {
      console.error(
        !currencyRates
          ? `Currency Rates are not available for preloading coin details. Please reload the app. Coin Symbol: ${coinSymbol}`
          : `${coinSymbol} has already been preloaded. Returning.`,
      );
      return;
    }

    // Mark the coin as being preloaded
    dispatch(appInfoActions.addCoinBeingPreloaded({ coinId: coinSymbol }));

    // Fetch coin details if required and not being preloaded
    if (handleFetch && symbolToFetch && currentCurrency && !isBeingPreloaded) {
      try {
        const fetchedDetails = await dispatch(
          cryptoApiSlice.endpoints.fetchCoinDetailsData.initiate({
            symbol: symbolToFetch,
            targetCurrency: currentCurrency,
          }),
        ).unwrap();
        detailsToPreload = fetchedDetails.coinDetails;
        coinSymbol = detailsToPreload.id;
      } catch (error) {
        console.error(
          `Error fetching coin details for ${symbolToFetch}:`,
          error,
        );
        dispatch(
          appInfoActions.removeCoinBeingPreloaded({ coinId: coinSymbol }),
        );
        return;
      }
    }

    if (!detailsToPreload) {
      console.warn(`No details available to preload for coin: ${coinSymbol}`);
      return;
    }

    // Select coin details after fetch if specified
    if (selectCoinAfterFetch) {
      dispatch(
        coinsActions.setSelectedCoinDetails({ coinDetails: detailsToPreload }),
      );
    }

    // Check if the coin is already being preloaded
    if (!isBeingPreloaded) {
      dispatch(appInfoActions.addCoinBeingPreloaded({ coinId: coinSymbol }));

      // Preload coin details for the current currency
      dispatch(
        coinsActions.setPreloadedCoinDetailsUsingPopularCoinsBase({
          coinDetails: detailsToPreload,
          currency: currentCurrency,
        }),
      );

      // Asynchronously preload for other currencies using the web worker
      postMessageToCurrencyTransformerWorker({
        requestType: CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES,
        requestData: {
          coinToTransform: detailsToPreload,
          fromCurrency: currentCurrency,
          currencyExchangeRates: currencyRates,
        },
        onComplete: () => {
          dispatch(
            appInfoActions.removeCoinBeingPreloaded({
              coinId: coinSymbol as string,
            }),
          );
          console.log(`Preloading completed for coin: ${coinSymbol}`);
        },
      });
    }
  },
);

/**
 * Action to preload a coin's details. This action posts a message to the currency transformer web worker
 * to start preloading the coin details for all available currencies. It also updates the Redux state
 * to track the preloading process.
 *
 * @param params - Parameters including coin details, preloading status, and coin ID.
 * @returns A redux-thunk action.
 */
export const preloadCoinDetails = (coinDetails: ICoinDetails) => {
  return (dispatch: TAppDispatch, getState: () => TRootState) => {
    const coinSymbol = coinDetails.coinAttributes.symbol;
    const state = getState();
    const { currentCurrency, currencyRates } = state.currency;
    const { coinsBeingPreloaded } = state.appInfo;
    const preloadingProcessHasBegun = coinsBeingPreloaded[coinSymbol];

    // Checking if currency exchange rates are available
    if (!currencyRates) {
      console.error(
        "Currency rates not available for preloading coin details:",
        coinSymbol,
      );
      return;
    }

    // Begin the preloading process if it wasn't initiated by a prior step like an API call
    // (i.e. if the data was loaded on the server but we want to preload it in the client)
    if (!preloadingProcessHasBegun) {
      console.log(`Begin preloading process for coin: ${coinSymbol}`);
      dispatch(appInfoActions.addCoinBeingPreloaded({ coinId: coinSymbol }));
    }

    // Preload coin details for the current currency
    dispatch(
      coinsActions.setPreloadedCoinDetailsUsingPopularCoinsBase({
        coinDetails,
        currency: currentCurrency,
      }),
    );

    // Asynchronously start preloading for other currencies using the web worker
    postMessageToCurrencyTransformerWorker({
      requestType: CTWMessageRequestType.COIN_DETAILS_ALL_CURRENCIES,
      requestData: {
        coinToTransform: coinDetails,
        fromCurrency: currentCurrency,
        currencyExchangeRates: currencyRates,
      },
      onComplete: () => {
        // Dispatch action to remove coin from preloading list upon completion
        dispatch(
          appInfoActions.removeCoinBeingPreloaded({ coinId: coinSymbol }),
        );
        console.log(`Preloading completed for coin: ${coinSymbol}`);
      },
    });
  };
};
