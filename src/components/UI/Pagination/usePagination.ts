import { useCallback, useEffect, useMemo, useState } from "react";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import {
  ELLIPSES,
  MOBILE_POPULAR_COINS_PAGE_SIZE,
  POPULAR_COINS_PAGE_SIZE,
} from "@/lib/constants/globalConstants";
import { range } from "lodash";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  selectIsMobile,
  selectIsTablet,
} from "@/lib/store/mediaQuery/mediaQuerySelectors";

/**
 * The constant STATIC_PAGINATION_ELEMENTS is used to account for the minimum number of elements
 * always present in the pagination component regardless of the current page's position. This includes:
 * - 1 for the first page link
 * - 1 for the last page link
 * - 1 for the current page link
 * - 2 for the ellipses that may appear to indicate skipped page numbers on either side of the current page.
 * This constant helps in determining if the full range of pages should be displayed without ellipses.
 */
const STATIC_PAGINATION_ELEMENTS = 5;
/**
 * Default sibling count on each side of the current page for pagination.
 * SiblingCount of 1 is a sensible default, providing a balance between
 * showing enough page links for quick navigation without overcrowding the pagination UI.
 * It ensures the current page is always displayed with one page link on either side if available.
 */
const DEFAULT_SIBLING_COUNT = 2;
const TABLET_SIBLING_COUNT = 1;
const MOBILE_SIBLING_COUNT = 0;

/**
 * Type definition for the pagination hook parameters.
 */
interface IUsePaginationParams {
  siblingCount?: number; // Number of page numbers to show on each side of the current page.
  totalItemsCount: number;
  currentPageNumber: number;
}

/**
 * Type definition for the pagination range item.
 * Can be a page number or a string representing ellipsis.
 */

export type TPaginationItem = number | typeof ELLIPSES;

interface IUsePaginationState {
  paginationRange: TPaginationItem[];
  onNext: () => void;
  onPrevious: () => void;
  goToPage: (pageNumber: number) => void;
}

/**
 * Custom hook to calculate the pagination range for displaying pagination controls.
 *
 * @param {IUsePaginationParams} params Configuration options for the hook.
 * @returns {TPaginationItem[]} The calculated range of pages, including dots for overflow indication.
 */
const usePagination = ({
  totalItemsCount,
  currentPageNumber,
}: IUsePaginationParams): IUsePaginationState => {
  const dispatch = useAppDispatch();
  const isMobile = useAppSelector(selectIsMobile);
  const isTablet = useAppSelector(selectIsTablet);
  // Determine the current sibling count based on device type using useMemo for optimization.
  const currentSiblingCount = useMemo(
    () =>
      isMobile
        ? MOBILE_SIBLING_COUNT
        : isTablet
        ? TABLET_SIBLING_COUNT
        : DEFAULT_SIBLING_COUNT,
    [isMobile, isTablet],
  );

  // Determine the page size based on device type using useMemo for optimization.
  const pageSize = useMemo(
    () => (isTablet ? MOBILE_POPULAR_COINS_PAGE_SIZE : POPULAR_COINS_PAGE_SIZE),
    [isTablet],
  );

  // Calculate the total number of pages.
  const totalPageCount = useMemo(
    () => Math.ceil(totalItemsCount / pageSize),
    [totalItemsCount, pageSize],
  );

  // Use useMemo to optimize the calculation of the pagination range, preventing unnecessary recalculations.
  const paginationRange: TPaginationItem[] = useMemo(() => {
    // Simple case: If the total number of pages is less than the pages we want to show, return the full range.
    if (totalPageCount <= currentSiblingCount + STATIC_PAGINATION_ELEMENTS) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    // Determine the indices for the left and right siblings of the current page.
    const leftSiblingIndex = Math.max(
      currentPageNumber - currentSiblingCount,
      1,
    );
    const rightSiblingIndex = Math.min(
      currentPageNumber + currentSiblingCount,
      totalPageCount,
    );

    // Decide whether to show dots based on the distance of siblings to the edges.
    const shouldShowLeftEllipses = leftSiblingIndex > 2;
    const shouldShowRightEllipses = rightSiblingIndex < totalPageCount - 1;

    // Construct the pagination range dynamically based on conditions.
    const paginationItems: TPaginationItem[] = [1]; // Always include the first page.

    // Include left dots and pages leading up to the current page if necessary.
    if (shouldShowLeftEllipses) {
      paginationItems.push(ELLIPSES);
    }

    // Define start and end indices for the page numbers to display, ensuring the pagination starts from the second page
    // and ends before the last, as the first and last pages are added manually.
    const startPageIndex = Math.max(2, leftSiblingIndex);
    const endPageIndex = Math.min(totalPageCount, rightSiblingIndex + 1);

    // Generate page numbers using the range function, simplifying the addition of multiple page numbers to paginationItems.
    const pageNumbers = range(startPageIndex, endPageIndex);
    paginationItems.push(...pageNumbers);

    // Include right dots and trailing pages if necessary.
    if (shouldShowRightEllipses) {
      paginationItems.push(ELLIPSES);
    }

    if (totalPageCount > 1) {
      paginationItems.push(totalPageCount); // Always include the last page.
    }

    return paginationItems;
  }, [currentPageNumber, totalPageCount, currentSiblingCount]);

  // Automatically adjust currentPageNumber if it's out of the total page count range
  useEffect(() => {
    if (currentPageNumber > totalPageCount) {
      dispatch(
        appInfoActions.setPopularCoinsListPageNumber({
          popularCoinsPageNumber: 1,
        }),
      );
    }
  }, [dispatch, totalPageCount, currentPageNumber]);

  // Navigation functions
  const onPrevious = useCallback(() => {
    if (currentPageNumber > 1) {
      dispatch(
        appInfoActions.setPopularCoinsListPageNumber({
          popularCoinsPageNumber: currentPageNumber - 1,
        }),
      );
    }
  }, [currentPageNumber, dispatch]);

  const onNext = useCallback(() => {
    if (currentPageNumber < totalPageCount) {
      dispatch(
        appInfoActions.setPopularCoinsListPageNumber({
          popularCoinsPageNumber: currentPageNumber + 1,
        }),
      );
    }
  }, [currentPageNumber, totalPageCount, dispatch]);

  const goToPage = useCallback(
    (pageNumber: number) => {
      dispatch(
        appInfoActions.setPopularCoinsListPageNumber({
          popularCoinsPageNumber: pageNumber,
        }),
      );
    },
    [dispatch],
  );

  return { paginationRange, onPrevious, onNext, goToPage };
};

export default usePagination;
