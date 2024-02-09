import { useState, useEffect, useRef } from "react";
import { ICoinOverview } from "@/types/coinTypes";
import { POPULAR_COINS_PAGE_SIZE } from "@/lib/constants/globalConstants";

/**
 * Defines the shape of the params received by useCoinsForCurrentPage.
 */
export interface IUseCoinsForCurrentPageParams {
  filteredCoins: ICoinOverview[];
  popularCoinsPageNumber: number;
}

/**
 * Defines the shape of the state returned by useCoinsForCurrentPage.
 */
interface IUseCoinsForCurrentPageState {
  coinsForCurrentPage: ICoinOverview[]; // Array of coins currently being displayed.
}

/**
 * Manages the display of cryptocurrency coins based on current pagination and search results.
 * This hook slices the array of filtered coins into separate pages to only display those relevant to the current page,
 * ensuring efficient data presentation without unnecessary computations or data exposure.
 *
 * @param params Object containing `filteredCoins` and `popularCoinsPageNumber`.
 * @param params.filteredCoins The list of coins filtered by the search criteria.
 * @param params.popularCoinsPageNumber The current page number for pagination.
 * @returns An object containing the `coinsForCurrentPage` array for the current page context.
 */
const useCurrentPageCoins = ({
  filteredCoins,
  popularCoinsPageNumber,
}: IUseCoinsForCurrentPageParams): IUseCoinsForCurrentPageState => {
  const [coinsForCurrentPage, setCoinsForCurrentPage] = useState<
    ICoinOverview[]
  >([]);
  // Use a ref to store a cache for pagination slices.
  const pageCache = useRef<Map<number, ICoinOverview[]>>(new Map());

  useEffect(() => {
    // If filteredCoins changes, clear the cache to ensure fresh pagination for new data.
    pageCache.current.clear();

    const calculateAndSetPage = () => {
      const firstPageIndex =
        (popularCoinsPageNumber - 1) * POPULAR_COINS_PAGE_SIZE;
      const lastPageIndex = firstPageIndex + POPULAR_COINS_PAGE_SIZE;
      // Perform the slice operation to get the new current page coins.
      const newCoinsForCurrentPage = filteredCoins.slice(
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
  }, [filteredCoins, popularCoinsPageNumber]); // Dependencies include filteredCoins to reset cache when it changes.

  return { coinsForCurrentPage };
};

export default useCurrentPageCoins;
