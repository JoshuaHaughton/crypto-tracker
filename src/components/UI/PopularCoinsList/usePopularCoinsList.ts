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
import { useSelector } from "react-redux";
import { TCurrencySymbol } from "@/lib/constants/globalConstants";
import { IPopularCoinSearchItem } from "@/lib/types/coinTypes";
import { LoadingStatus } from "@/lib/types/apiRequestTypes";

/**
 * Interface defining the structure for the state and setters returned by usePopularCoinsList hook.
 */
interface IUsePopularCoinsListState {
  search: string;
  setSearch: (searchTerm: string) => void;
  coinsForCurrentPage: IPopularCoinSearchItem[];
  isLoading: boolean;
  isBreakpoint380: boolean;
  isBreakpoint680: boolean;
  isBreakpoint1250: boolean;
  popularCoinsListPageNumber: number;
  currentSymbol: TCurrencySymbol;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
  const coinsStatus = useSelector(selectInitialPopularCoinsStatus);
  const isLoading = coinsStatus === LoadingStatus.LOADING;

  const isBreakpoint380 = useSelector(selectIsBreakpoint380);
  const isBreakpoint680 = useSelector(selectIsBreakpoint680);
  const isBreakpoint1250 = useSelector(selectIsBreakpoint1250);
  const popularCoinsListPageNumber = useSelector(selectPopularCoinsPageNumber);
  const currentSymbol = useSelector(selectCurrentSymbol);

  // Manage search term via Redux, reducing local state management.
  const { search, setSearch } = usePopularCoinsSearch();

  // Fetch current page coins based on Redux-stored search results, enhancing performance.
  const { coinsForCurrentPage } = useCurrentPageCoins();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log("handleInputChange");
    setSearch(e.target.value);
  };

  // Provides API for search term management and current page coins display.
  return {
    search,
    setSearch,
    coinsForCurrentPage,
    handleInputChange,
    isLoading,
    isBreakpoint380,
    isBreakpoint680,
    isBreakpoint1250,
    popularCoinsListPageNumber,
    currentSymbol,
  };
}
