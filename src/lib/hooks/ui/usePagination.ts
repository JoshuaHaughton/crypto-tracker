import { POPULAR_COINS_PAGE_SIZE } from "@/lib/constants/globalConstants";
import { useAppSelector } from "@/lib/store";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import { selectPopularCoinsCount } from "@/lib/store/coins/coinsSelectors";
import { useMemo } from "react";
import { range } from "lodash";

let DOTS = "DOTS";

export const usePagination = ({ siblingCount = 1 }) => {
  const popularCoinsPageNumber = useAppSelector(selectPopularCoinsPageNumber);
  const popularCoinsLength = useAppSelector(selectPopularCoinsCount);

  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(
      popularCoinsLength / POPULAR_COINS_PAGE_SIZE,
    );

    // Pages count is determined as siblingCount + firstPage + lastPage + popularCoinsPageNumber + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    /*
      Case 1:
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    /*
    	Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
    */
    const leftSiblingIndex = Math.max(popularCoinsPageNumber - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      popularCoinsPageNumber + siblingCount,
      totalPageCount,
    );

    /*
      We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    /*
    	Case 2: No left dots to show, but rights dots to be shown
    */
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPageCount];
    }

    /*
    	Case 3: No right dots to show, but left dots to be shown
    */
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount,
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    /*
    	Case 4: Both left and right dots to be shown
    */
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
  }, [popularCoinsLength, siblingCount, popularCoinsPageNumber]);

  return paginationRange;
};
