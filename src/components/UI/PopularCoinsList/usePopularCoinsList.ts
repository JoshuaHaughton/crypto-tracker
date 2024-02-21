import { usePopularCoinsSearch } from "../../../lib/hooks/ui/usePopularCoinsSearch";
import useCurrentPageCoins from "../../../lib/hooks/ui/useCurrentPageCoins";
import {
  selectInitialPopularCoinsStatus,
  selectPopularCoinsPageNumber,
} from "@/lib/store/appInfo/appInfoSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import {
  selectIsBreakpoint380,
  selectIsBreakpoint680,
  selectIsBreakpoint1250,
} from "@/lib/store/mediaQuery/mediaQuerySelectors";
import { ChangeEvent } from "react";
import { TCurrencySymbol } from "@/lib/constants/globalConstants";
import { IPopularCoinSearchItem } from "@/lib/types/coinTypes";
import { LoadingStatus } from "@/lib/types/apiRequestTypes";
import { useAppSelector } from "@/lib/store";
import useCoinDetailsPreloader from "@/lib/hooks/preloaders/useCoinDetailsPreloader";

/**
 * Interface defining the structure for the state and setters returned by usePopularCoinsList hook.
 */
interface IUsePopularCoinsListState {
  search: string;
  coinsForCurrentPage: IPopularCoinSearchItem[];
  isLoading: boolean;
  isBreakpoint380: boolean;
  isBreakpoint680: boolean;
  isBreakpoint1250: boolean;
  popularCoinsListPageNumber: number;
  currentSymbol: TCurrencySymbol;
  setSearch: (searchTerm: string) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleHover: (symbol: string) => void;
  handleClick: (symbol: string) => void;
}

/**
 * Integrates search and pagination for displaying popular coins using Redux for state management.
 * It optimizes data flow and UI consistency by minimizing local state usage.
 *
 * @returns {IUsePopularCoinsListState} Includes the search state, setter function, and coins for the current page.
 */
export function usePopularCoinsList(): IUsePopularCoinsListState {
  console.log("usePopularCoinsList render");
  // Monitor loading status via redux
  const isBreakpoint380 = useAppSelector(selectIsBreakpoint380);
  const isBreakpoint680 = useAppSelector(selectIsBreakpoint680);
  const isBreakpoint1250 = useAppSelector(selectIsBreakpoint1250);
  const popularCoinsListPageNumber = useAppSelector(
    selectPopularCoinsPageNumber,
  );
  const currentSymbol = useAppSelector(selectCurrentSymbol);
  const popularCoinsLoadingStatus = useAppSelector(
    selectInitialPopularCoinsStatus,
  );
  const isLoading = popularCoinsLoadingStatus === LoadingStatus.LOADING;

  // Manage search term via Redux, reducing local state management.
  const { search, setSearch, results } = usePopularCoinsSearch();

  // Fetch current page coins based on Redux-stored search results, enhancing performance.
  const { coinsForCurrentPage } = useCurrentPageCoins({
    currentQuery: search,
    searchResults: results,
    currentPageNumber: popularCoinsListPageNumber,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log("handleInputChange");
    setSearch(e.target.value);
  };

  const { handleHover, handleClick } = useCoinDetailsPreloader();

  // Provides API for search term management and current page coins display.
  return {
    search,
    coinsForCurrentPage,
    isLoading,
    isBreakpoint380,
    isBreakpoint680,
    isBreakpoint1250,
    popularCoinsListPageNumber,
    currentSymbol,
    setSearch,
    handleInputChange,
    handleHover,
    handleClick,
  };
}
