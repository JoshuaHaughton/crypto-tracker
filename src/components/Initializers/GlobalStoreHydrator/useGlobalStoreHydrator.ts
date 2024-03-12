import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { currencyActions } from "@/lib/store/currency/currencySlice";
import {
  InitialDataType,
  TInitialPageDataOptions,
} from "@/lib/types/apiRequestTypes";
import { initializeCoinCache } from "@/thunks/initializeCoinCacheThunk";
import { preloadCoinDetailsThunk } from "@/thunks/preloadCoinDetailsThunk";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import { selectIsStoreHydrated } from "@/lib/store/appInfo/appInfoSelectors";

/**
 * Custom hook to initialize and hydrate application data based on initial server-side fetched data.
 * This hook ensures the Redux store is updated with the relevant data for the application's initial state.
 * It handles different data types and scenarios: loading popular coins, specific coin details, and currency exchange rates.
 *
 * @param initialData - The initial data fetched server-side, containing either popular coins or specific coin details, along with currency exchange rates.
 */
const useGlobalStoreHydrator = (initialData: TInitialPageDataOptions) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (initialData) {
      // Dispatch actions based on the type of initial data provided.
      console.log("initialData - StoreHydrator", initialData);

      // Dispatch initial currency & exchange rates if available. These should be populated first as they're used down the line in other preloading/initialization methods
      dispatch(
        currencyActions.setCurrencyRates({
          currencyRates: initialData.data.currencyExchangeRates,
        }),
      );
      dispatch(
        currencyActions.setDisplayedCurrency({
          currency: initialData.currentCurrency,
        }),
      );

      switch (initialData.dataType) {
        case InitialDataType.POPULAR_COINS:
          // Clean up state from previous page if necessary
          dispatch(coinsActions.resetSelectedCoinDetails());

          // Dispatch popular coins and carousel data if available.
          dispatch(appInfoActions.startInitialPopularCoinsLoading());
          if (initialData.data.popularCoins) {
            dispatch(
              coinsActions.setPopularCoins({
                coinList: initialData.data.popularCoins,
              }),
            );
            console.warn("CAROUSEL RESET BY useGlobalStoreHydrator");
            dispatch(
              coinsActions.setCarouselSymbolList({
                carouselSymbols: initialData.data.carouselSymbolList,
              }),
            );
            dispatch(appInfoActions.completeInitialPopularCoinsLoading());
          } else {
            // Dispatch failure action
            dispatch(appInfoActions.failInitialPopularCoinsLoading());
          }
          break;

        case InitialDataType.COIN_DETAILS:
          // Clean up state from previous page if necessary
          dispatch(coinsActions.resetPopularCoins());

          // Dispatch selected coin details if available.
          if (initialData.data.coinDetails) {
            dispatch(
              coinsActions.setSelectedCoinDetails({
                coinDetails: initialData.data.coinDetails,
              }),
            );
            // Preload specific coin details for the coin details page.
            dispatch(
              preloadCoinDetailsThunk({
                detailsToPreload: initialData.data.coinDetails,
              }),
            );
          }
          break;

        default:
          // Log or handle unknown data types.
          console.warn(`Unhandled initial data type: ${initialData}`);
          break;
      }

      // Always initialize the coin cache, regardless of the page type.
      // This is crucial for ensuring that the popular coins list is available application-wide.
      if (
        initialData?.dataType === InitialDataType.POPULAR_COINS &&
        initialData.data.popularCoins
      ) {
        dispatch(
          initializeCoinCache({
            handleFetch: false,
            popularCoins: initialData.data.popularCoins,
          }),
        );
        console.log(
          "Dispatching initializeCoinCache with provided popular coins data.",
        );
      } else {
        // If popular coins data is not provided (e.g., on coin details page), fetch from the API.
        dispatch(initializeCoinCache({ handleFetch: true }));
        console.log(
          "Dispatching initializeCoinCache to fetch popular coins data.",
        );
      }

      // Set the store as hydrated so we don't do this process again. We will update the data on the client via Server actions for a smoother experience
      dispatch(appInfoActions.completeStoreHydration());
    }
    // Should only run on the initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useGlobalStoreHydrator;
