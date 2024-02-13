import { usePopularCoinsSearch } from "./usePopularCoinsSearch";
import useCurrentPageCoins from "./useCurrentPageCoins";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import {
  selectIsBreakpoint380,
  selectIsBreakpoint680,
  selectIsBreakpoint1250,
} from "@/lib/store/mediaQuery/mediaQuerySelectors";
import { ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { TCurrencySymbol } from "@/lib/constants/globalConstants";

/**
 * Interface defining the structure for the state and setters returned by usePopularCoinsList hook.
 */
interface IUsePopularCoinsListState {
  search: string;
  setSearch: (searchTerm: string) => void;
  coinsForCurrentPage: any[]; // Adjust the type according to your data structure
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
    isBreakpoint380,
    isBreakpoint680,
    isBreakpoint1250,
    popularCoinsListPageNumber,
    currentSymbol,
  };
}
