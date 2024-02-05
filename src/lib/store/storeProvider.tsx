"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { TAppStore, makeStore } from ".";
import { initialCoinsState } from "./coins/coinsSlice";
import { initialCurrencyState } from "./currency/currencySlice";
import {
  IFormattedPopularCoinsApiResponse,
  IFormattedCoinDetailsAPIResponse,
} from "@/types/apiResponseTypes";
import {
  isPopularCoinsApiResponse,
  isCoinDetailsApiResponse,
} from "@/utils/api.utils";
import { ICoinOverview } from "@/types/coinTypes";

export type TInitialDataOptions =
  | IFormattedPopularCoinsApiResponse
  | IFormattedCoinDetailsAPIResponse
  | null;

interface IStoreProviderProps {
  children: React.ReactNode;
  initialData: TInitialDataOptions;
}

/**
 * The `StoreProvider` component is a HOC for initializing and providing a Redux store to the React component tree in a Next.js Single Page Application (SPA). This component facilitates the setup of the Redux store with initial state values derived from server-side data fetching. It plays a crucial role in ensuring state consistency across client-side navigations, especially in server-rendered SPA environments where initial data is crucial for the first render.
 *
 * This component accepts several optional parameters to initialize different parts of the Redux store. The initialization parameters include data for popular coins, specific coin details, a carousel symbol list, and currency exchange rates. These parameters are used to set up the initial state of the Redux store, thus allowing the application to start with pre-fetched server data.
 *
 * @param {React.ReactNode} children - Child components that will have access to the Redux store.
 * @param {TInitialDataOptions} [initialData] - Initial data for the store.
 * @returns {React.Component} A component that wraps its children with a Redux Provider, supplying the configured store.
 */
export const StoreProvider: React.FC<IStoreProviderProps> = ({
  children,
  initialData,
}) => {
  const storeRef = useRef<TAppStore>();
  let initialState = {};

  let coinsInitialState = { ...initialCoinsState };
  let currencyInitialState = { ...initialCurrencyState };

  if (isPopularCoinsApiResponse(initialData)) {
    const { popularCoins, carouselSymbolList, currencyExchangeRates } =
      initialData;
    coinsInitialState = {
      ...coinsInitialState,
      popularCoins,
      popularCoinsMap: popularCoins.reduce((acc, coin) => {
        acc[coin.symbol] = coin;
        return acc;
      }, {} as Record<string, ICoinOverview>),
      carouselSymbolList,
    };
    currencyInitialState = {
      ...currencyInitialState,
      //remember to add current currency here when cookie loic is ready
      currencyRates: currencyExchangeRates,
    };
  } else if (isCoinDetailsApiResponse(initialData)) {
    const { coinDetails, currencyExchangeRates } = initialData;
    coinsInitialState = {
      ...coinsInitialState,
      selectedCoinDetails: coinDetails,
    };
    currencyInitialState = {
      ...currencyInitialState,
      //remember to add current currency here when cookie loic is ready
      currencyRates: currencyExchangeRates,
    };
  }

  initialState = {
    coins: coinsInitialState,
    currency: currencyInitialState,
  };

  // Create the store with initial states. This will only initialize provided slices.
  if (!storeRef.current) {
    storeRef.current = makeStore(initialState);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
};
