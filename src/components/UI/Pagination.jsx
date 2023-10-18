import React from "react";
import { usePagination } from "../../hooks/usePagination";
import styles from "./pagination.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { appInfoActions } from "../../store/appInfo";

const siblingCount = 1;
const totalCount = 100;
const pageSize = 10;

const Pagination = () => {
  const dispatch = useDispatch();
  const popularCoinsListPageNumber = useSelector(
    (state) => state.appInfo.popularCoinsListPageNumber,
  );

  const paginationRange = usePagination({
    currentPage: popularCoinsListPageNumber,
    totalCount,
    siblingCount,
    pageSize,
  });

  // If there are less than 2 times in pagination range we shall not render the component
  if (popularCoinsListPageNumber === 0 || paginationRange?.length < 2) {
    return null;
  }

  const onNext = () => {
    dispatch(
      appInfoActions.updatePopularCoinsListPageNumber({
        popularCoinsListPageNumber: popularCoinsListPageNumber + 1,
      }),
    );
  };

  const onPrevious = () => {
    dispatch(
      appInfoActions.updatePopularCoinsListPageNumber({
        popularCoinsListPageNumber: popularCoinsListPageNumber - 1,
      }),
    );
  };
  let lastPage = null;

  if (paginationRange) {
    lastPage = paginationRange[paginationRange?.length - 1];
  }
  return (
    <ul className={styles.container}>
      {/* Left navigation arrow */}
      <li
        className={
          popularCoinsListPageNumber === 1
            ? `${styles.item} ${styles.disabled}`
            : styles.item
        }
        onClick={onPrevious}
      >
        <div className={`${styles.arrow} ${styles.left}`} />
      </li>
      {paginationRange?.map((pageNumber, idx) => {
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === "DOTS") {
          return (
            <li className={`${styles.item} ${styles.dots}`} key={idx}>
              &#8230;
            </li>
          );
        }

        // Render our Page Pills
        return (
          <li
            className={
              pageNumber === popularCoinsListPageNumber
                ? `${styles.item} ${styles.selected}`
                : styles.item
            }
            onClick={() =>
              dispatch(
                appInfoActions.updatePopularCoinsListPageNumber({
                  popularCoinsListPageNumber: pageNumber,
                }),
              )
            }
            key={idx}
          >
            {pageNumber}
          </li>
        );
      })}
      {/*  Right Navigation arrow */}
      <li
        className={
          popularCoinsListPageNumber === lastPage
            ? `${styles.item} ${styles.disabled}`
            : styles.item
        }
        onClick={onNext}
      >
        <div className={`${styles.arrow} ${styles.right}`} />
      </li>
    </ul>
  );
};

export default Pagination;
