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
 * Memoized selector for a specific currency conversion rate.
 * Uses `createSelector` for efficient memoization to prevent redundant recalculations,
 * especially useful when accessing specific currency rates frequently.
 *
 * @param state - The current state of the application.
 * @param fromCurrency - The currency from which the conversion starts.
 * @param toCurrency - The target currency for conversion.
 * @returns The conversion rate for the specified currency pair, or null if not found.
 */
export const selectCurrencyRate = createSelector(
  [
    selectCurrencyRates,
    (_: TRootState, fromCurrency: TCurrencyString) => fromCurrency,
    (_: TRootState, __: TCurrencyString, toCurrency: TCurrencyString) =>
      toCurrency,
  ],
  (currencyRates, fromCurrency, toCurrency) => {
    return currencyRates?.[fromCurrency]?.[toCurrency] ?? null;
  },
);

/**
 * Enhanced memoized selector to calculate a value conversion based on the current currency rate.
 * Utilizes `createSelector` for efficient memoization to prevent redundant recalculations,
 * which is crucial for performance when dealing with dynamic currency rate changes.
 *
 * @param fromCurrency - The currency from which the conversion starts.
 * @param toCurrency - The target currency for conversion.
 * @param value - The value to be converted.
 * @returns The converted value based on the specified currency rate.
 */
export const selectConvertedValue = createSelector(
  [
    selectCurrencyRates,
    (_: TRootState, fromCurrency: TCurrencyString) => fromCurrency,
    (_: TRootState, __: TCurrencyString, toCurrency: TCurrencyString) =>
      toCurrency,
    (_: TRootState, __: TCurrencyString, ___: TCurrencyString, value: number) =>
      value,
  ],
  (currencyRates, fromCurrency, toCurrency, value) => {
    // Ensure rate is a number, default to 1 if not found
    const rate = currencyRates?.[fromCurrency]?.[toCurrency] ?? 1;

    // Perform conversion
    return value * rate;
  },
);
