import { TCurrencyString } from "@/lib/constants";
import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "..";

/**
 * Selector for the current currency.
 * Directly returns the current currency from the state.
 * @param state - The current state of the application.
 * @returns The current currency string.
 */
export const selectCurrentCurrency = (state: TRootState) =>
  state.currency.currentCurrency;

/**
 * Selector for the current currency symbol.
 * Directly returns the current currency symbol from the state.
 * @param state - The current state of the application.
 * @returns The current currency symbol.
 */
export const selectCurrentSymbol = (state: TRootState) =>
  state.currency.currentSymbol;

/**
 * Selector for getting all stored currency rates.
 * Directly returns the currency rates from the state.
 * @param state - The current state of the application.
 * @returns The currency rates.
 */
export const selectCurrencyRates = (state: TRootState) =>
  state.currency.currencyRates;

/**
 * Memoized selector for a specific currency rate.
 * Uses `createSelector` for efficient memoization to prevent redundant recalculations,
 * especially useful when accessing specific currency rates frequently.
 * @param state - The current state of the application.
 * @param currency - The currency to identify the specific rate.
 * @returns The rate for the specified currency.
 */
export const selectCurrencyRate = createSelector(
  [selectCurrencyRates, (_: TRootState, currency: TCurrencyString) => currency],
  (currencyRates, currency) => currencyRates[currency] || null,
);

/**
 * Enhanced memoized selector to calculate a value conversion based on the current currency rate.
 * Utilizes `createSelector` for efficient memoization to prevent redundant recalculations,
 * which is crucial for performance when dealing with dynamic currency rate changes.
 * @param state - The current state of the application.
 * @param value - The value to be converted.
 * @returns The converted value based on the current currency rate.
 */
export const selectConvertedValue = createSelector(
  [
    selectCurrentCurrency,
    selectCurrencyRates,
    (_: TRootState, value: number) => value,
  ],
  (currentCurrency, currencyRates, value) => {
    const rate = currencyRates[currentCurrency];
    return rate ? value * rate : value;
  },
);
