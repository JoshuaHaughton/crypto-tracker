import React from "react";
import styles from "./PopularCoinsListItemSkeleton.module.scss";

/**
 * Represents a skeleton placeholder for an individual item in the popular coins list.
 * It simulates the layout of a coin list item during loading state.
 *
 * @returns - A React functional component displaying the skeleton of a single coin item.
 */
const PopularCoinsItemSkeleton: React.FC = () => {
  return (
    <tr className={styles.skeletonRow}>
      <td className={styles.skeletonCell}>
        <div className={styles.skeletonImage} />
        <div className={styles.skeletonText} />
      </td>
      <td className={styles.skeletonCell}>
        <div className={styles.skeletonPrice} />
      </td>
      <td className={styles.skeletonCell}>
        <div className={styles.skeletonVolume} />
      </td>
      <td className={styles.skeletonCell}>
        <div className={styles.skeletonChange} />
      </td>
      <td className={styles.skeletonCell}>
        <div className={styles.skeletonMarketCap} />
      </td>
    </tr>
  );
};

export default PopularCoinsItemSkeleton;
