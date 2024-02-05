"use client";
import { useEffect, useRef } from "react";
import { Provider, useDispatch } from "react-redux";
import { TAppStore, makeStore } from ".";
import { ICoinDetails, ICoinOverview } from "@/types/coinTypes";
import { TCurrencyExchangeRates, TCurrencyRates } from "@/types/currencyTypes";
import {
  initializeStore,
  initializeStoreDispatch,
} from "@/utils/reduxStore.utils";

/**
 * `DispatchData` is a higher-order component designed for providing a Redux store to the React component tree in a Next.js Single Page Application (SPA). This component is responsible for initializing the Redux store with server-side fetched data, allowing for an efficient hydration process when the application is first loaded. It's particularly effective in scenarios where initial data needs to be fetched on the server and then passed down to the client when using Nextjs 14 with the App Router. This setup allows the SPA to maintain state consistency across client-side navigations while benefiting from server-side rendering optimizations.
 *
 * The component accepts several optional parameters for initializing different parts of the Redux store. This includes data for popular coins, specific coin details, carousel coins, and currency exchange rates. Upon mounting, the DispatchData uses these data to dispatch actions that populate the respective slices of the Redux store. This approach ensures that the initial render of the application on the client side has access to the pre-fetched data, thereby aligning with SPA best practices in a server-rendered environment.
 *
 * @param {ICoinOverview[]} [popularCoins] - Initial popular coins data for the store.
 * @param {ICoinDetails} [coinDetails] - Initial coin details for the store.
 * @param {string[]} [carouselSymbolList] - Initial carousel symbol list for the store.
 * @param {TCurrencyExchangeRates} [currencyExchangeRates] - Initial currency exchange rates for the store.
 * @returns {React.Component} Component wrapping children with a Redux Provider.
 */
export const DispatchData: React.FC<{
  popularCoins?: ICoinOverview[];
  coinDetails?: ICoinDetails;
  carouselSymbolList?: string[];
  currencyExchangeRates?: TCurrencyExchangeRates;
}> = ({
  popularCoins,
  coinDetails,
  carouselSymbolList,
  currencyExchangeRates,
}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    // Initialize the store with provided data, if available
    // This is primarily for server-side rendering to hydrate the Redux store with initial data. SPA Navigations won't trigger server calls
    if (
      popularCoins ||
      coinDetails ||
      carouselSymbolList ||
      currencyExchangeRates
    ) {
      initializeStoreDispatch(dispatch, {
        popularCoins,
        coinDetails,
        carouselSymbolList,
        currencyExchangeRates,
      });
    }
  }, [
    dispatch,
    popularCoins,
    coinDetails,
    carouselSymbolList,
    currencyExchangeRates,
  ]);

  // Wrap the application with the Redux Provider and pass the store reference
  // This enables Redux state management across the application
  return null;
};
