"use client";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeStore } from "@/utils/reduxStore.utils"; // Updated import path
import { ICoinDetails, ICoinOverview } from "@/types/coinTypes";
import { TCurrencyExchangeRates } from "@/types/currencyTypes";

/**
 * Props for InitialDataProvider component.
 */
interface InitialDataProviderProps {
  children: React.ReactNode;
  popularCoins?: ICoinOverview[];
  coinDetails?: ICoinDetails;
  carouselCoins?: ICoinOverview[];
  currencyExchangeRates?: TCurrencyExchangeRates;
}

/**
 * The `InitialDataProvider` component is crucial for ensuring a seamless integration of server-side fetched data with the client-side Redux store in a Next.js application. This necessity arises from the challenge of synchronizing server-rendered content with client-side state management, particularly in SPA architectures that leverage Redux for state handling.
 *
 * In SSR or SSG contexts, the server and client operate in separate execution environments, leading to a scenario where data fetched on the server is not immediately available to the client-side Redux store. This disconnect can result in inconsistencies in the application state and user experience, as the client-side Redux store may not reflect the data initially rendered by the server.
 *
 * To bridge this gap, the `InitialDataProvider` takes on the role of a mediator. It accepts server-fetched data as props and utilizes the `useEffect` hook in conjunction with Redux's `dispatch` function to populate the Redux store with this data on the client side. This approach ensures that the initial state of the Redux store on the client is in sync with the server-rendered content, providing a consistent and accurate representation of the application's state right from the first render.
 *
 * This mechanism is particularly important when components within the application's layout require access to the Redux store. By using `InitialDataProvider` in neccesary pages, in conjunction with `StoreProvider` in the layout (e.g., layout.tsx), we can ensure that all components, regardless of their position in the component tree, have access to a correctly initialized Redux store. This setup allows for the dynamic rendering of different pages, each with its unique data requirements, while maintaining a consistent state across client-side navigations.
 *
 * @param children - Child components that will be rendered inside this provider.
 * @param popularCoins - Initial data for popular coins.
 * @param coinDetails - Initial data for specific coin details.
 * @param carouselCoins - Initial data for carousel coins.
 * @param currencyExchangeRates - Initial data for currency exchange rates.
 * @returns A React component that dispatches initial data to the Redux store and renders its children.
 */
export const InitialDataProvider: React.FC<InitialDataProviderProps> = ({
  children,
  popularCoins,
  coinDetails,
  carouselCoins,
  currencyExchangeRates,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Dispatching an action to initialize the Redux store with fetched data
    if (popularCoins || coinDetails || carouselCoins || currencyExchangeRates) {
      initializeStore(dispatch, {
        popularCoins,
        coinDetails,
        carouselCoins,
        currencyExchangeRates,
      });
    }
  }, [
    dispatch,
    popularCoins,
    coinDetails,
    carouselCoins,
    currencyExchangeRates,
  ]);

  return <>{children}</>;
};
