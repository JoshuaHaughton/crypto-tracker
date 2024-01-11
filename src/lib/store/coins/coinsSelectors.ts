import { TCurrencyString } from "@/lib/constants/globalConstants";
import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "..";
import { ICoinDetails } from "@/types/coinTypes";

/**
 * Selector for popular coins.
 * Does not use `createSelector` for memoization because it directly retrieves a simple state slice without complex computation or derived data.
 * @param state - The current state of the application.
 * @returns An array of popular coin overviews.
 */
export const selectPopularCoins = (state: TRootState) =>
  state.coins.popularCoins;

/**
 * Selector for carousel coins.
 * Does not use `createSelector` for memoization as it directly fetches a straightforward state segment without the need for derived or computed data.
 * @param state - The current state of the application.
 * @returns An array of carousel coin overviews.
 */
export const selectCarouselCoins = (state: TRootState) =>
  state.coins.carouselCoins;

/**
 * Selector for selected coin details.
 * This selector does not use `createSelector` because it retrieves a direct piece of state without any additional computation or filtering.
 * @param state - The current state of the application.
 * @returns Details of the selected coin.
 */
export const selectSelectedCoinDetails = (state: TRootState) =>
  state.coins.selectedCoinDetails;

/**
 * Selector for preloaded coin details.
 * Avoids `createSelector` as it simply accesses a specific slice of state without performing any complex operations or data transformations.
 * @param state - The current state of the application.
 * @returns Cached details of coins.
 */
export const selectPreloadedCoinDetails = (state: TRootState) =>
  state.coins.preloadedCoinDetailsByCurrency;

/**
 * Enhanced memoized selector to get preloaded coin details by the current currency.
 * Uses `createSelector` to memoize results, optimizing performance by avoiding unnecessary recalculations.
 * Automatically retrieves the current currency from the state.
 *
 * @param state - The current state of the application.
 * @returns An object of coin details for the current currency.
 */
export const selectPreloadedCoinDetailsByCurrentCurrency = createSelector(
  [
    (state: TRootState) => state.coins.preloadedCoinDetailsByCurrency,
    (state: TRootState) => state.currency.currentCurrency,
  ],
  (
    preloadedCoinDetailsByCurrency,
    currentCurrency,
  ): Record<string, ICoinDetails> | {} =>
    preloadedCoinDetailsByCurrency[currentCurrency] || {},
);

/**
 * Memoized selector to get preloaded coin details by the current currency and coin ID.
 * Utilizes `createSelector` for efficient memoization to prevent redundant recalculations.
 * Automatically retrieves the current currency from the state.
 *
 * @param state - The current state of the application.
 * @param id - The unique identifier of the coin.
 * @returns The details of the specified coin within the current currency, or undefined if not found.
 */
export const selectPreloadedCoinDetailsByCurrentCurrencyAndId = createSelector(
  [
    (state: TRootState) => state.coins.preloadedCoinDetailsByCurrency,
    (state: TRootState) => state.currency.currentCurrency,
    (_: TRootState, id: string) => id,
  ],
  (
    preloadedCoinDetailsByCurrency,
    currentCurrency,
    id,
  ): ICoinDetails | undefined => {
    const coinDetails = preloadedCoinDetailsByCurrency[currentCurrency];
    return coinDetails ? coinDetails[id] : undefined;
  },
);

/**
 * Memoized selector for a specific coin's details by the current currency.
 * Utilizes `createSelector` for efficient memoization to prevent redundant recalculations.
 * Automatically retrieves the current currency from the state.
 *
 * @param state - The current state of the application.
 * @returns Coin details associated with the current currency or null if not available.
 */
export const selectSelectedCoinDetailsByCurrentCurrency = createSelector(
  [
    (state: TRootState) => state.coins.cachedSelectedCoinDetailsByCurrency,
    (state: TRootState) => state.currency.currentCurrency,
  ],
  (cachedSelectedCoinDetailsByCurrency, currentCurrency) =>
    cachedSelectedCoinDetailsByCurrency[currentCurrency] || null,
);
