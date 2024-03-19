"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { ICoinDetails, ICoinOverview } from "../types/coinTypes";
import { TCurrencyExchangeRates } from "../types/currencyTypes";

export interface IInitialPageData {
  popularCoins?: ICoinOverview[];
  popularCoinsMap?: Record<string, ICoinOverview>;
  carouselSymbolList?: string[];
  selectedCoinDetails?: ICoinDetails;
  currencyExchanceRates?: TCurrencyExchangeRates;
}

/**
 * Creates a context for page-specific data with an undefined initial value.
 * This context will be used to provide and consume data specific to a page.
 */
const InitialPageDataContext = createContext<IInitialPageData | undefined>(
  undefined,
);

/**
 * Custom hook to use the InitialPageDataContext.
 * This hook simplifies access to the context data and ensures the context is used properly.
 *
 * @throws Will throw an error if used outside of a InitialPageDataProvider.
 * @returns The context data.
 */
export const useInitialPageData = (): IInitialPageData => {
  const context = useContext(InitialPageDataContext);
  if (context === undefined) {
    throw new Error(
      "useInitialPageData must be used within a InitialPageDataProvider",
    );
  }
  return context;
};

interface IInitialPageDataProviderProps {
  children: ReactNode;
  value: IInitialPageData | undefined;
}

/**
 * Component responsible for providing page-specific data to its child components.
 * Utilize this provider at the top level of any page to pass down specific data to all child components,
 * enabling a modular and clean approach to handling page-specific data.
 *
 * @param {IInitialPageDataProviderProps} props - Contains children and the contextual value to be provided.
 */
export const InitialPageDataProvider: React.FC<
  IInitialPageDataProviderProps
> = ({ children, value }: IInitialPageDataProviderProps) => {
  return (
    <InitialPageDataContext.Provider value={value}>
      {children}
    </InitialPageDataContext.Provider>
  );
};
