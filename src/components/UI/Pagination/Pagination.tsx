import React from "react";
import styles from "./Pagination.module.scss";
import usePagination from "@/components/UI/Pagination/usePagination";
import PaginationItem from "./PaginationItem";
import PaginationArrow from "./PaginationArrow";

/**
 * Renders pagination controls with previous/next arrows and interactive page numbers.
 *
 * @returns {React.ReactElement | null} The Pagination component or null if pagination is not needed.
 */
const Pagination: React.FC = (): React.ReactElement | null => {
  const { paginationRange, currentPage, onPrevious, onNext, goToPage } =
    usePagination();

  // Do not render if there's only one page or none.
  if (paginationRange.length <= 1) {
    return null;
  }

  // Determine if the "Previous" and "Next" arrows should be disabled.
  const isFirstPage = currentPage === 1;
  const isLastPage =
    currentPage === paginationRange[paginationRange.length - 1];

  return (
    <ul className={styles.container}>
      {/* Previous page arrow, disabled if on the first page */}
      <PaginationArrow
        direction="left"
        onClick={onPrevious}
        isDisabled={isFirstPage}
      />

      {paginationRange.map((pageNumber, idx) => (
        <PaginationItem
          key={idx}
          pageNumber={pageNumber}
          isCurrent={pageNumber === currentPage}
          onClick={() => typeof pageNumber === "number" && goToPage(pageNumber)}
        />
      ))}

      {/* Next page arrow, disabled if on the last page */}
      <PaginationArrow
        direction="right"
        onClick={onNext}
        isDisabled={isLastPage}
      />
    </ul>
  );
};

export default Pagination;
