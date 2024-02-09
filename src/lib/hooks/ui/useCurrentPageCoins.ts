import { useState, useEffect, useRef } from "react";
import { ICoinOverview } from "@/types/coinTypes";
import { POPULAR_COINS_PAGE_SIZE } from "@/lib/constants/globalConstants";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import { useAppSelector } from "@/lib/store";
import { selectSearchResults } from "@/lib/store/search/searchSelectors";

/**
 * Defines the shape of the state returned by useCoinsForCurrentPage.
 */
interface IUseCurrentPageCoinsState {
  coinsForCurrentPage: ICoinOverview[]; // Array of coins currently being displayed.
}

/**
 * Manages the display of cryptocurrency coins based on current pagination and search results.
 * This hook slices the array of filtered coins into separate pages to only display those relevant to the current page,
 * ensuring efficient data presentation without unnecessary computations or data exposure.
 *
 * @returns An object containing the `coinsForCurrentPage` array for the current page context.
 */
const useCurrentPageCoins = (): IUseCurrentPageCoinsState => {
  // Get necessary Redux state
  const searchResults = useAppSelector(selectSearchResults);
  const popularCoinsPageNumber = useAppSelector(selectPopularCoinsPageNumber);

  const [coinsForCurrentPage, setCoinsForCurrentPage] = useState<
    ICoinOverview[]
  >([]);
  // Use a ref to store a cache for pagination slices.
  const pageCache = useRef<Map<number, ICoinOverview[]>>(new Map());

  useEffect(() => {
    // If searchResults changes, clear the cache to ensure fresh pagination for new data.
    pageCache.current.clear();

    const calculateAndSetPage = () => {
      const firstPageIndex =
        (popularCoinsPageNumber - 1) * POPULAR_COINS_PAGE_SIZE;
      const lastPageIndex = firstPageIndex + POPULAR_COINS_PAGE_SIZE;
      // Perform the slice operation to get the new current page coins.
      const newCoinsForCurrentPage = searchResults.slice(
        firstPageIndex,
        lastPageIndex,
      );

      // Update the cache with the new slice for the current page.
      pageCache.current.set(popularCoinsPageNumber, newCoinsForCurrentPage);
      setCoinsForCurrentPage(newCoinsForCurrentPage);
    };

    // Check if the current page is already in the cache.
    const cachedPage = pageCache.current.get(popularCoinsPageNumber);
    if (cachedPage) {
      setCoinsForCurrentPage(cachedPage);
    } else {
      calculateAndSetPage();
    }
  }, [searchResults, popularCoinsPageNumber]); // Dependencies include searchResults to reset cache when it changes.

  return { coinsForCurrentPage };
};

export default useCurrentPageCoins;
