import React from "react";
import styles from "./PopularCoinsSkeleton.module.scss";
import { POPULAR_COINS_PAGE_SIZE } from "@/lib/constants/globalConstants";

interface IPopularCoinsSkeletonProps {
  /**
   * Number of skeleton rows to display.
   * This value defaults to POPULAR_COINS_PAGE_SIZE if not provided.
   */
  rows?: number;
}

/**
 * Represents a skeleton placeholder for the popular coins list.
 * Renders a default or specified number of skeleton rows to simulate the loading state.
 *
 * @param {IPopularCoinsSkeletonProps} props - Component props.
 * @returns React functional component displaying the skeleton rows.
 */
const PopularCoinsSkeleton: React.FC<IPopularCoinsSkeletonProps> = ({
  rows = POPULAR_COINS_PAGE_SIZE,
}: IPopularCoinsSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <tr key={index}>
          <td className={styles.skeletonCell}>
            <div className={styles.skeleton}></div>
          </td>
          <td className={styles.skeletonCell}>
            <div className={styles.skeleton}></div>
          </td>
          <td className={styles.skeletonCell}>
            <div className={styles.skeleton}></div>
          </td>
          <td className={styles.skeletonCell}>
            <div className={styles.skeleton}></div>
          </td>
          <td className={styles.skeletonCell}>
            <div className={styles.skeleton}></div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default PopularCoinsSkeleton;
