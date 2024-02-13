import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "..";
import { ICoinOverview } from "@/types/coinTypes";

/**
 * Selector to see if the search has been initialized yet.
 * @param state - The current state of the application.
 * @returns The fuzzy search instance or null if not set.
 */
export const selectIsSearchInitialized = (state: TRootState): boolean =>
  state.search.isSearchInitialized;

/**
 * Selector to get the current search query.
 * Directly retrieves the query from the state without additional computation.
 * @param state - The current state of the application.
 * @returns The current search query as a string.
 */
export const selectCurrentQuery = (state: TRootState): string =>
  state.search.currentQuery;

/**
 * Direct selector for search results.
 * Retrieves search results from the state without memoization.
 * This approach is preferred when the results do not require further computations or filtering,
 * offering a simpler alternative to using `createSelector`.
 *
 * @param state - The current state of the application.
 * @returns An array of search results.
 */
export const selectSearchResults = (state: TRootState): ICoinOverview[] =>
  state.search.results;
