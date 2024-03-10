import { usePopularCoinsSearch } from "./usePopularCoinsSearch";
import useCurrentPageCoins from "./useCurrentPageCoins";
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
import { useInitialPageData } from "@/lib/contexts/initialPageDataContext";
import { selectPopularCoins } from "@/lib/store/coins/coinsSelectors";

/**
 * Interface defining the structure for the state and setters returned by usePopularCoinsList hook.
 */
interface IUsePopularCoinsListState {
  searchQuery: string;
  coinsForCurrentPage: IPopularCoinSearchItem[];
  currentPageNumber: number;
  totalItemsCount: number;
  currentSymbol: TCurrencySymbol;
  popularCoinsAreLoading: boolean;
  isBreakpoint380: boolean;
  isBreakpoint680: boolean;
  isBreakpoint1250: boolean;
  setSearchQuery: (searchTerm: string) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleItemMouseEnter: (symbol: string) => void;
  handleNavigation: (symbol: string) => void;
}

/**
 * Integrates search and pagination for displaying popular coins using Redux for state management.
 * It optimizes data flow and UI consistency by minimizing local state usage.
 *
 * @returns {IUsePopularCoinsListState} Includes the search state, setter function, and coins for the current page.
 */
export function usePopularCoinsList(): IUsePopularCoinsListState {
  console.log("usePopularCoinsList render");
  const currentPageNumber = useAppSelector(selectPopularCoinsPageNumber);
  const isBreakpoint380 = useAppSelector(selectIsBreakpoint380);
  const isBreakpoint680 = useAppSelector(selectIsBreakpoint680);
  const isBreakpoint1250 = useAppSelector(selectIsBreakpoint1250);
  const currentSymbol = useAppSelector(selectCurrentSymbol);
  const allReduxPopularCoins = useAppSelector(selectPopularCoins);
  // Fallback to page specific data if Redux store doesn't have carousel coins yet due to initial hydration.
  const { popularCoins } = useInitialPageData();

  const allPopularCoins: ICoinOverview[] =
    allReduxPopularCoins.length > 0
      ? allReduxPopularCoins
      : (popularCoins as ICoinOverview[]);

  const popularCoinsLoadingStatus = useAppSelector(
    selectInitialPopularCoinsStatus,
  );
  const popularCoinsAreLoading =
    popularCoinsLoadingStatus === LoadingStatus.LOADING;

  // Manage search term via Redux, reducing local state management.
  const { searchQuery, setSearchQuery, searchResults } = usePopularCoinsSearch({
    allPopularCoins,
  });

  // Fetch current page coins based on Redux-stored search results, enhancing performance.
  const { coinsForCurrentPage } = useCurrentPageCoins({
    currentQuery: searchQuery,
    searchResults: searchResults,
    currentPageNumber,
  });

  const totalItemsCount =
    searchQuery.trim().length > 0
      ? searchResults.length
      : allPopularCoins.length;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log("handleInputChange");
    setSearchQuery(e.target.value);
  };

  const { handlePreload, handleNavigation } = useCoinDetailsPreloader();

  // Provides API for search term management and current page coins display.
  return {
    searchQuery,
    coinsForCurrentPage,
    totalItemsCount,
    currentPageNumber,
    currentSymbol,
    popularCoinsAreLoading,
    isBreakpoint380,
    isBreakpoint680,
    isBreakpoint1250,
    setSearchQuery,
    handleInputChange,
    handleItemMouseEnter: handlePreload,
    handleNavigation,
  };
}
