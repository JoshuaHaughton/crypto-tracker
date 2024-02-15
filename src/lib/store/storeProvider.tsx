"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { TAppStore, makeStore } from ".";
import { initialCoinsState } from "./coins/coinsSlice";
import { initialCurrencyState } from "./currency/currencySlice";
import { ICoinOverview } from "@/types/coinTypes";
import { InitialDataType, TInitialDataOptions } from "@/types/apiRequestTypes";

interface IStoreProviderProps {
  children: React.ReactNode;
  initialData: TInitialDataOptions;
}

/**
 * The `StoreProvider` component is a HOC for initializing and providing a Redux store to the React component tree in a Next.js Single Page Application (SPA). This component facilitates the setup of the Redux store with initial state values derived from server-side data fetching. It plays a crucial role in ensuring state consistency across client-side navigations, especially in server-rendered SPA environments where initial data is crucial for the first render.
 *
 * This component accepts several optional parameters to initialize different parts of the Redux store. The initialization parameters include data for popular coins, specific coin details, a carousel symbol list, and currency exchange rates. These parameters are used to set up the initial state of the Redux store, thus allowing the application to start with pre-fetched server data.
 *
 * @param props - The props object for the StoreProvider.
 * @param props.children - Child components that will have access to the Redux store.
 * @param props.initialData - Optional initial data for the store, used for initializing specific state slices.
 * @returns A component that wraps its children with a Redux Provider, supplying the configured store.
 */
export const StoreProvider: React.FC<IStoreProviderProps> = ({
  children,
  initialData,
}) => {
  console.log("initializing store");
  const storeRef = useRef<TAppStore>();

  // Only initialize store and state if the store hasn't been created yet
  if (!storeRef.current) {
    let initialState = {};

    let coinsInitialState = { ...initialCoinsState };
    let currencyInitialState = { ...initialCurrencyState };

    if (initialData) {
      // Extracting the currency exchange rates outside the switch
      // as it's common to both PopularCoins and CoinDetails cases
      const { currencyExchangeRates } = initialData.data;
      // Updating the currency initial state with currency exchange rates
      currencyInitialState.currencyRates = currencyExchangeRates;

      switch (initialData.dataType) {
        case InitialDataType.POPULAR_COINS: {
          // Destructuring the data specific to PopularCoins
          const { popularCoins, carouselSymbolList } = initialData.data;

          // Updating the coins initial state with data from PopularCoins
          coinsInitialState.popularCoins = popularCoins;
          coinsInitialState.popularCoinsMap = popularCoins.reduce(
            (acc, coin) => {
              acc[coin.symbol] = coin;
              return acc;
            },
            {} as Record<string, ICoinOverview>,
          );
          coinsInitialState.carouselSymbolList = carouselSymbolList;

          break;
        }

        case InitialDataType.COIN_DETAILS: {
          // Destructuring the data specific to CoinDetails
          const { coinDetails } = initialData.data;

          // Updating the coins initial state with data from CoinDetails
          coinsInitialState.selectedCoinDetails = coinDetails;

          break;
        }
      }
    }

    initialState = {
      coins: coinsInitialState,
      currency: currencyInitialState,
    };

    // Create the store with initial states. This will only initialize provided slices.
    storeRef.current = makeStore(initialState);
    console.log("store initialized");
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
};
