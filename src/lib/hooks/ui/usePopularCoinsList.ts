import { ICoinOverview } from "@/types/coinTypes";
import { usePopularCoinsSearch } from "./usePopularCoinsSearch";
import useCurrentPageCoins from "./useCurrentPageCoins";

/**
 * Interface defining the expected params for the state and setters returned by usePopularCoinsList hook.
 */
interface IUsePopularCoinsListParams {
  displayedPopularCoinsList: ICoinOverview[];
  popularCoinsPageNumber: number;
}

/**
 * Interface defining the structure for the state and setters returned by usePopularCoinsList hook.
 */
interface IUsePopularCoinsListState {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  coinsForCurrentPage: ICoinOverview[];
}

/**
 * A custom hook that integrates search and pagination functionality for displaying a list of popular coins.
 *
 * @param displayedPopularCoinsList - The complete list of coins available for display.
 * @param popularCoinsListPageNumber - The current page number for pagination purposes.
 * @returns An object containing the search state, setter function for the search state, and the currently shown coins.
 */
export function usePopularCoinsList({
  displayedPopularCoinsList,
  popularCoinsPageNumber,
}: IUsePopularCoinsListParams): IUsePopularCoinsListState {
  // Use the search hook to manage the search state and obtain filtered results based on the search query.
  const { search, setSearch, searchResults } = usePopularCoinsSearch(
    displayedPopularCoinsList,
  );

  // Use pagination hook on filtered search results or the full list if no search is made.
  // This allows displaying a subset of coins based on the current page and search filter.
  const { coinsForCurrentPage } = useCurrentPageCoins({
    filteredCoins: searchResults,
    popularCoinsPageNumber,
  });

  // Return the search query, a setter for updating the search query, and the list of coins to be shown based on the current pagination and search filter.
  return { search, setSearch, coinsForCurrentPage };
}
