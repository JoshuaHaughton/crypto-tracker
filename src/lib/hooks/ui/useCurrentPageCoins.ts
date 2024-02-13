import { useState, useEffect, useRef, useCallback } from "react";
import { ICoinOverview } from "@/types/coinTypes";
import { POPULAR_COINS_PAGE_SIZE } from "@/lib/constants/globalConstants";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import { useAppSelector } from "@/lib/store";
import {
  selectCurrentQuery,
  selectSearchResults,
} from "@/lib/store/search/searchSelectors";
import { selectPopularCoins } from "@/lib/store/coins/coinsSelectors";

/**
 * Defines the shape of the state returned by useCoinsForCurrentPage.
 */
interface IUseCurrentPageCoinsState {
  coinsForCurrentPage: ICoinOverview[]; // Array of coins currently being displayed.
}

/**
 * Custom hook to manage the display of cryptocurrency coins for the current pagination page,
 * taking into account the search results if a search query is active.
 *
 * @returns The state including the array of coins to be displayed on the current page.
 */
export const useCurrentPageCoins = (): IUseCurrentPageCoinsState => {
  const [coinsForCurrentPage, setCoinsForCurrentPage] = useState<
    ICoinOverview[]
  >([]);

  // Redux state selectors.
  const searchResults = useAppSelector(selectSearchResults);
  const currentQuery = useAppSelector(selectCurrentQuery);
  const popularCoins = useAppSelector(selectPopularCoins);
  const pageNumber = useAppSelector(selectPopularCoinsPageNumber);

  // Cache for storing pagination results to avoid recalculations.
  const pageCacheRef = useRef<Map<string, ICoinOverview[]>>(new Map());

  /**
   * Computes and updates the list of coins for the current page, using cached results when available.
   * Determines the source of coins based on the presence of a search query.
   */
  const updateCoinsForCurrentPage = useCallback(() => {
    const activeSource =
      currentQuery.trim().length > 0 ? searchResults : popularCoins;
    const cacheKey = `${pageNumber}-${
      activeSource === searchResults ? "searchResults" : "all"
    }`;

    if (!pageCacheRef.current.has(cacheKey)) {
      const startIndex = (pageNumber - 1) * POPULAR_COINS_PAGE_SIZE;
      const endIndex = startIndex + POPULAR_COINS_PAGE_SIZE;
      const coinsForPage = activeSource.slice(startIndex, endIndex);

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
