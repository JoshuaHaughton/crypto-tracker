import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store";
import { coinsActions } from "@/lib/store/coins/coinsSlice";
import { currencyActions } from "@/lib/store/currency/currencySlice";
import {
  InitialDataType,
  TInitialPageDataOptions,
} from "@/lib/types/apiRequestTypes";
import { initializeCoinCache } from "@/thunks/initializeCoinCacheThunk";
import { preloadCoinDetailsThunk } from "@/thunks/preloadCoinDetailsThunk";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";

/**
 * Custom hook to initialize and hydrate application data based on initial server-side fetched data.
 * This hook ensures the Redux store is updated with the relevant data for the application's initial state.
 * It handles different data types and scenarios: loading popular coins, specific coin details, and currency exchange rates.
 *
 * @param initialData - The initial data fetched server-side, containing either popular coins or specific coin details, along with currency exchange rates.
 */
const useStoreHydrator = (initialData: TInitialPageDataOptions) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Dispatch actions based on the type of initial data provided.
    if (initialData) {
      console.log("initialData - StoreHydrator", initialData);
      switch (initialData.dataType) {
        case InitialDataType.POPULAR_COINS:
          // Dispatch popular coins and carousel data if available.
          dispatch(appInfoActions.startInitialPopularCoinsLoading());
          if (initialData.data.popularCoins) {
            dispatch(
              coinsActions.setPopularCoins({
                coinList: initialData.data.popularCoins,
              }),
            );
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

      // Dispatch currency exchange rates if available.
      if (initialData.data.currencyExchangeRates) {
        dispatch(
          currencyActions.setCurrencyRates({
            currencyRates: initialData.data.currencyExchangeRates,
          }),
        );
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
    }
    // Should only run on the initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useStoreHydrator;
