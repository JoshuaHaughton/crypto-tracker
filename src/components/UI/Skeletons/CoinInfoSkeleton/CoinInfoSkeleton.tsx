import React from "react";
import styles from "./CoinInfoSkeleton.module.scss";
import { ICoinInfoProps } from "../../CoinInfo/CoinInfo";

const CoinInfoSkeleton: React.FC<ICoinInfoProps> = () => {
  return (
    <div className={styles.coinInfoSkeleton}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonText}></div>
      <div className={styles.skeletonText}></div>
    </div>
  );
};

export default CoinInfoSkeleton;
