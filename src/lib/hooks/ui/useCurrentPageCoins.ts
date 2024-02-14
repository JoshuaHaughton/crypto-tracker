import { useState, useEffect, useRef, useCallback } from "react";
import { ICoinOverview, IPopularCoinSearchItem } from "@/types/coinTypes";
import { POPULAR_COINS_PAGE_SIZE } from "@/lib/constants/globalConstants";
import { useAppSelector } from "@/lib/store";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import {
  selectCurrentQuery,
  selectSearchResults,
} from "@/lib/store/search/searchSelectors";
import { selectPopularCoins } from "@/lib/store/coins/coinsSelectors";

/**
 * Defines the shape of the state returned by useCoinsForCurrentPage.
 */
interface IUseCurrentPageCoinsState {
  coinsForCurrentPage: IPopularCoinSearchItem[]; // Array of coins currently being displayed.
}

/**
 * Custom hook to manage the display of cryptocurrency coins for the current pagination page,
 * taking into account the search results if a search query is active.
 *
 * @returns The state including the array of coins to be displayed on the current page.
 */
export const useCurrentPageCoins = (): IUseCurrentPageCoinsState => {
  // Redux state selectors.
  const searchResults = useAppSelector(selectSearchResults);
  const currentQuery = useAppSelector(selectCurrentQuery);
  const popularCoins = useAppSelector(selectPopularCoins);
  const pageNumber = useAppSelector(selectPopularCoinsPageNumber);

  // Initial load logic
  const [coinsForCurrentPage, setCoinsForCurrentPage] = useState<
    IPopularCoinSearchItem[]
  >(() =>
    prepareCoinsForDisplay(
      currentQuery,
      searchResults,
      popularCoins,
      pageNumber,
    ),
  );

  // Cache for storing pagination results to avoid recalculations.
  const pageCacheRef = useRef<Map<string, IPopularCoinSearchItem[]>>(new Map());

  /**
   * Computes and updates the list of coins for the current page, using cached results when available.
   * Determines the source of coins based on the presence of a search query.
   */
  const updateCoinsForCurrentPage = useCallback(() => {
    const cacheKey = `${pageNumber}-${
      currentQuery.trim().length > 0 ? "searchResults" : "popular"
    }`;

    if (!pageCacheRef.current.has(cacheKey)) {
      const coinsForPage = prepareCoinsForDisplay(
        currentQuery,
        searchResults,
        popularCoins,
        pageNumber,
      );

      // Update cache with new results.
      pageCacheRef.current.set(cacheKey, coinsForPage);
    }

    // Set state with cached or newly computed coins.
    setCoinsForCurrentPage(pageCacheRef.current.get(cacheKey) || []);
  }, [currentQuery, pageNumber, searchResults, popularCoins]);

  // Clears cache when search results or popular coins list changes.
  useEffect(() => {
    pageCacheRef.current.clear();
    updateCoinsForCurrentPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, popularCoins]);

  // Effect for updating coins for the current page on pagination or query change.
  useEffect(() => {
    updateCoinsForCurrentPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuery, pageNumber]);

  return { coinsForCurrentPage };
};

export default useCurrentPageCoins;

/**
 * Prepares an array of coin items for display on the current page, converting popular coins to the search item format if necessary,
 * and slicing the array based on pagination. This function handles the logic for displaying either search results or popular coins,
 * ensuring that the data structure is consistent regardless of the source.
 *
 * @param {string} currentQuery - The current search query used to determine if search results should be used.
 * @param {IPopularCoinSearchItem[]} searchResults - The array of search results, each including potential match details for highlighting.
 * @param {ICoinOverview[]} popularCoins - The default array of popular coins, not including search match details.
 * @param {number} pageNumber - The current page number for pagination, used to calculate the slice of coins to display.
 * @returns {IPopularCoinSearchItem[]} - An array of coin items formatted for display, including only the items for the current page.
 */
function prepareCoinsForDisplay(
  currentQuery: string,
  searchResults: IPopularCoinSearchItem[],
  popularCoins: ICoinOverview[],
  pageNumber: number,
): IPopularCoinSearchItem[] {
  // Check if there is an active search query to determine the source of the coins.
  const isSearchActive = currentQuery.trim().length > 0;

  // If there is an active search, use the searchResults directly. Otherwise, convert popularCoins to the IPopularCoinSearchItem format.
  // This conversion is necessary to maintain a consistent data structure for rendering, regardless of the coin source.
  const initialSource = isSearchActive
    ? searchResults
    : popularCoins.map((coin) => ({
        coinDetails: coin,
        // Omit matchDetails for popularCoins as they are not part of search results and don't require highlighting.
      }));

  // Calculate the start and end indices for slicing the array based on the current page number and the predefined page size.
  const startIndex = (pageNumber - 1) * POPULAR_COINS_PAGE_SIZE;
  const endIndex = startIndex + POPULAR_COINS_PAGE_SIZE;

  // Slice the initialSource array to get only the coins for the current page, ensuring efficient data loading and display.
  return initialSource.slice(startIndex, endIndex);
}
