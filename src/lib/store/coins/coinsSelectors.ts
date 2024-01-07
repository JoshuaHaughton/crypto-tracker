import { TCurrencyString } from "@/lib/constants";
import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "..";
import coinsSlice from "./coinsSlice";

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
 * Enhanced memoized selector to get preloaded coin details by a specific currency.
 * Uses `createSelector` to memoize results, optimizing performance by avoiding unnecessary recalculations when the specific currency's coin details remain unchanged.
 * @param state - The current state of the application.
 * @param currency - The currency to filter the coin details by.
 * @returns An object of coin details for the specified currency.
 */
export const selectPreloadedCoinDetailsByCurrency = createSelector(
  [
    (state: TRootState, currency: TCurrencyString) =>
      state.coins.preloadedCoinDetailsByCurrency[currency],
  ],
  (coinDetailsByCurrency) => coinDetailsByCurrency || {},
);

/**
 * Memoized selector for a specific coin's details by currency.
 * Utilizes `createSelector` for efficient memoization to prevent redundant recalculations,
 * especially useful when dealing with multiple currencies and their associated details.
 *
 * @param state - The current state of the application.
 * @param currency - The currency to identify the specific coin details.
 * @returns Coin details associated with the specified currency or null if not available.
 */
export const selectSelectedCoinDetailsByCurrency = createSelector(
  [
    (state: TRootState) => state.coins.cachedSelectedCoinDetailsByCurrency,
    (_: TRootState, currency: TCurrencyString) => currency,
  ],
  (cachedSelectedCoinDetailsByCurrency, currency) =>
    cachedSelectedCoinDetailsByCurrency[currency] || null,
);
