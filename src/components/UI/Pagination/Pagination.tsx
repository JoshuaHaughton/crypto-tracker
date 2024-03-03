import React from "react";
import styles from "./Pagination.module.scss";
import usePagination from "@/components/UI/Pagination/usePagination";
import PaginationItem from "./PaginationItem";
import PaginationArrow from "./PaginationArrow";

interface IPaginationParams {
  totalItemsCount: number;
  currentPageNumber: number;
}

/**
 * Renders pagination controls with previous/next arrows and interactive page numbers.
 *
 * @returns {React.ReactElement | null} The Pagination component or null if pagination is not needed.
 */
const Pagination: React.FC<IPaginationParams> = ({
  totalItemsCount,
  currentPageNumber,
}: IPaginationParams): React.ReactElement | null => {
  const { paginationRange, onPrevious, onNext, goToPage } = usePagination({
    totalItemsCount,
    currentPageNumber,
  });

  // Determine if the "Previous" and "Next" arrows should be disabled.
  const isFirstPage = currentPageNumber === 1;
  const isLastPage = currentPageNumber === paginationRange.at(-1);

  return (
    <div className={styles.container}>
      {/* Previous page arrow, disabled if on the first page */}
      <PaginationArrow
        direction="left"
        onClick={onPrevious}
        isDisabled={isFirstPage}
      />

      <ul className={styles.listContainer}>
        {paginationRange.map((pageNumber, idx) => (
          <PaginationItem
            key={idx}
            pageNumber={pageNumber}
            isCurrent={pageNumber === currentPageNumber}
            onClick={() =>
              typeof pageNumber === "number" && goToPage(pageNumber)
            }
          />
        ))}
      </ul>

      {/* Next page arrow, disabled if on the last page */}
      <PaginationArrow
        direction="right"
        onClick={onNext}
        isDisabled={isLastPage}
      />
    </div>
  );
};

export default Pagination;
