
import React from 'react';
import { usePagination, DOTS } from './usePagination';
import styles from './pagination.module.scss';
const Pagination = props => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
    className
  } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize
  });

  // If there are less than 2 times in pagination range we shall not render the component
  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];
  return (
    <ul
      className={styles.container}
    >
       {/* Left navigation arrow */}
      <li
        className={currentPage === 1 ? `${styles.item} ${styles.disabled}` : styles.item}
        onClick={onPrevious}
      >
        <div className={`${styles.arrow} ${styles.left}`} />
      </li>
      {paginationRange.map(pageNumber => {
         
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === "DOTS") {
          return <li className={`${styles.item} ${styles.dots}`}>&#8230;</li>;
        }
		
        // Render our Page Pills
        return (
          <li
            className={pageNumber === currentPage ? `${styles.item} ${styles.selected}` : styles.item}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}
      {/*  Right Navigation arrow */}
      <li
        className={currentPage === lastPage ? `${styles.item} ${styles.disabled}` : styles.item}
        onClick={onNext}
      >
        <div className={`${styles.arrow} ${styles.right}`} />
      </li>
    </ul>
  );
};

export default Pagination;