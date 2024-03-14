import { useEffect } from "react";
import { useAppSelector } from "@/lib/store";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import { selectIsMobile } from "@/lib/store/mediaQuery/mediaQuerySelectors";

/**
 * Custom hook for handling page behavior on the Home Page, specifically for popular coins pagination.
 * This hook detects changes in the page number from the global state and auto-scrolls to a fixed position
 * if the page number is not the initial one. This ensures a consistent user experience during pagination.
 *
 * @returns {void}
 */
const useHomePage = () => {
  const isMobile = useAppSelector(selectIsMobile);
  const popularCoinsListPageNumber = useAppSelector(
    selectPopularCoinsPageNumber,
  );

  useEffect(() => {
    if (!isMobile && popularCoinsListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, [isMobile, popularCoinsListPageNumber]);
};

export default useHomePage;
