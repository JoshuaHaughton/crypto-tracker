import { TAppDispatch, TRootState } from "@/lib/store";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { ICoinDetails } from "@/types/coinTypes";
import { postMessageToCurrencyTransformerWorker } from "../../public/webWorkers/currencyTransformer/manager";
import { CTWMessageRequestType } from "../../public/webWorkers/currencyTransformer/types";

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
