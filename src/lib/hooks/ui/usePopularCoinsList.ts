import { ICoinOverview } from "@/types/coinTypes";
import { usePopularCoinsSearch } from "./usePopularCoinsSearch";
import useCurrentPageCoins from "./useCurrentPageCoins";

/**
 * Interface defining the structure for the state and setters returned by usePopularCoinsList hook.
 */
interface IUsePopularCoinsListState {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  coinsForCurrentPage: ICoinOverview[];
}

/**
 * Integrates search and pagination for displaying popular coins using Redux for state management.
 * It optimizes data flow and UI consistency by minimizing local state usage.
 *
 * @returns {IUsePopularCoinsListState} Includes the search state, setter function, and coins for the current page.
 */
export function usePopularCoinsList(): IUsePopularCoinsListState {
  // Manage search term via Redux, reducing local state management.
  const { search, setSearch } = usePopularCoinsSearch();

  // Fetch current page coins based on Redux-stored search results, enhancing performance.
  const { coinsForCurrentPage } = useCurrentPageCoins();

  // Provides API for search term management and current page coins display.
  return { search, setSearch, coinsForCurrentPage };
}
