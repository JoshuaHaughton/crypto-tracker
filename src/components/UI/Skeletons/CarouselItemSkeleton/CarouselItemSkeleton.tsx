import React from "react";
import styles from "./CarouselItemSkeleton.module.scss";

/**
 * A placeholder skeleton component for CarouselItem. It's used during the loading state
 * to maintain the layout and provide a visual cue that content is being loaded.
 *
 * @returns {React.FC} A functional component representing the loading state of a carousel item.
 */
const CarouselItemSkeleton: React.FC = () => {
  return (
    <div className={styles.itemSkeleton}>
      <div className={styles.imageSkeleton} />
      <div className={styles.textSkeleton} />
      {/* Shorter text skeleton */}
      <div className={styles.textSkeleton} style={{ width: "60%" }} />
    </div>
  );
};

export default CarouselItemSkeleton;
