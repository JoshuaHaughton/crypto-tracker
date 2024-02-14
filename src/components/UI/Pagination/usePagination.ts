import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/lib/store";
import { appInfoActions } from "@/lib/store/appInfo/appInfoSlice";
import {
  ELLIPSES,
  POPULAR_COINS_PAGE_SIZE,
} from "@/lib/constants/globalConstants";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import { selectTotalSearchItemsCount } from "@/lib/store/search/searchSelectors";
import { range } from "lodash";

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
 * Type definition for the pagination hook parameters.
 */
interface IUsePaginationParams {
  siblingCount?: number; // Number of page numbers to show on each side of the current page.
}

/**
 * Type definition for the pagination range item.
 * Can be a page number or a string representing ellipsis.
 */

type PaginationItem = number | typeof ELLIPSES;

interface IUsePaginationState {
  paginationRange: PaginationItem[];
  currentPage: number;
  onNext: () => void;
  onPrevious: () => void;
  goToPage: (pageNumber: number) => void;
}

/**
 * Custom hook to calculate the pagination range for displaying pagination controls.
 *
 * @param {IUsePaginationParams} params Configuration options for the hook.
 * @returns {PaginationItem[]} The calculated range of pages, including dots for overflow indication.
 */
const usePagination = ({
  /**
   * Default sibling count on each side of the current page for pagination.
   * SiblingCount of 1 is a sensible default, providing a balance between
   * showing enough page links for quick navigation without overcrowding the pagination UI.
   * It ensures the current page is always displayed with one page link on either side if available.
   */
  siblingCount = 1,
}: IUsePaginationParams = {}): IUsePaginationState => {
  const dispatch = useDispatch();
  // Retrieve the current page number and the total count of items from the Redux store.
  const currentPage = useAppSelector(selectPopularCoinsPageNumber);
  const totalItemsCount = useAppSelector(selectTotalSearchItemsCount);

  // Calculate the total number of pages.
  const totalPageCount = useMemo(
    () => Math.ceil(totalItemsCount / POPULAR_COINS_PAGE_SIZE),
    [totalItemsCount],
  );

  // Use useMemo to optimize the calculation of the pagination range, preventing unnecessary recalculations.
  const paginationRange: PaginationItem[] = useMemo(() => {
    // Simple case: If the total number of pages is less than the pages we want to show, return the full range.
    if (totalPageCount <= siblingCount + STATIC_PAGINATION_ELEMENTS) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    // Determine the indices for the left and right siblings of the current page.
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount,
    );

    // Decide whether to show dots based on the distance of siblings to the edges.
    const shouldShowLeftEllipses = leftSiblingIndex > 2;
    const shouldShowRightEllipses = rightSiblingIndex < totalPageCount - 1;

    // Construct the pagination range dynamically based on conditions.
    const paginationItems: PaginationItem[] = [1]; // Always include the first page.

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
  }, [currentPage, totalPageCount, siblingCount]);

  // Navigation functions
  const onPrevious = useCallback(() => {
    if (currentPage > 1) {
      dispatch(
        appInfoActions.setPopularCoinsListPageNumber({
          popularCoinsPageNumber: currentPage - 1,
        }),
      );
    }
  }, [currentPage, dispatch]);

  const onNext = useCallback(() => {
    if (currentPage < totalPageCount) {
      dispatch(
        appInfoActions.setPopularCoinsListPageNumber({
          popularCoinsPageNumber: currentPage + 1,
        }),
      );
    }
  }, [currentPage, totalPageCount, dispatch]);

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

  return { paginationRange, currentPage, onPrevious, onNext, goToPage };
};

export default usePagination;
