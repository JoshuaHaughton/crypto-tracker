"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { TAppStore, makeStore } from ".";
import { initialCurrencyState } from "./currency/currencySlice";
import { SYMBOLS_BY_CURRENCIES } from "../constants/globalConstants";
import { TInitialReduxDataOptions } from "../types/apiRequestTypes";

interface IGlobalStoreProviderProps {
  children: React.ReactNode;
  initialData?: TInitialReduxDataOptions;
}

/**
 * The `GlobalStoreProvider` component is a HOC for initializing and providing a Redux store to the React component tree in a Next.js Single Page Application (SPA). This component facilitates the setup of the Redux store with initial state values derived from server-side data fetching. It plays a crucial role in ensuring state consistency across client-side navigations, especially in server-rendered SPA environments where initial data is crucial for the first render.
 *
 * This component accepts several optional parameters to initialize different parts of the Redux store. The initialization parameters include data for popular coins, specific coin details, a carousel symbol list, and currency exchange rates. These parameters are used to set up the initial state of the Redux store, thus allowing the application to start with pre-fetched server data.
 *
 * @param props - The props object for the GlobalStoreProvider.
 * @param props.children - Child components that will have access to the Redux store.
 * @param props.initialData - Optional initial data for the store, used for initializing specific state slices.
 * @returns A component that wraps its children with a Redux Provider, supplying the configured store.
 */
export const GlobalStoreProvider: React.FC<IGlobalStoreProviderProps> = ({
  children,
  initialData,
}) => {
  console.log("Store Provider render");
  const storeRef = useRef<TAppStore>();

  // Only initialize store and state if the store hasn't been created yet
  if (!storeRef.current) {
    console.log("initializing store");
    let initialState = {};

    let currencyInitialState = { ...initialCurrencyState };

    if (initialData) {
      const { currencyPreference } = initialData;
      // Updating the currency initial state with the current currency
      currencyInitialState.currentCurrency = currencyPreference;
      currencyInitialState.currentSymbol =
        SYMBOLS_BY_CURRENCIES[currencyPreference];
    }

    initialState = {
      currency: currencyInitialState,
    };

    // Create the store with initial states. This will only initialize provided slices.
    storeRef.current = makeStore(initialState);
    console.log("store initialized");
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
};
