"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { ICoinDetails, ICoinOverview } from "../types/coinTypes";
import { TCurrencyExchangeRates } from "../types/currencyTypes";

// Define the shape of your page-specific data.
export interface IPageData {
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
const PageContext = createContext<IPageData | undefined>(undefined);

/**
 * Custom hook to use the PageContext.
 * This hook simplifies access to the context data and ensures the context is used properly.
 *
 * @throws Will throw an error if used outside of a PageProvider.
 * @returns The context data.
 */
export const usePageData = (): IPageData => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error("usePageData must be used within a PageProvider");
  }
  return context;
};

interface IPageProviderProps {
  children: ReactNode;
  value: IPageData | undefined;
}

/**
 * Component responsible for providing page-specific data to its child components.
 * Utilize this provider at the top level of any page to pass down specific data to all child components,
 * enabling a modular and clean approach to handling page-specific data.
 *
 * @param {IPageProviderProps} props - Contains children and the contextual value to be provided.
 */
export const PageProvider: React.FC<IPageProviderProps> = ({
  children,
  value,
}: IPageProviderProps) => {
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
};
