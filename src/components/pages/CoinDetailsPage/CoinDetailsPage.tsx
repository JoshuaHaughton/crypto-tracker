"use client";

import styles from "./CoinDetailsPage.module.scss";
import useCoinDetails from "./useCoinDetails";
import CoinInfo from "@/components/UI/CoinInfo/CoinInfo";
import CoinDetailsChart from "@/components/UI/CoinDetailsChart/CoinDetailsChart";
import { IInitialCoinDetailsPageData } from "@/lib/utils/dataFormat.utils";

const CoinDetails = () => {
  const {
    currentSymbol,
    coinDetails,
    handleHomepagePreload,
    handleHomepageNavigation,
  } = useCoinDetails();

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <CoinInfo
          coinAttributes={coinDetails?.coinAttributes}
          currentSymbol={currentSymbol}
          handleHomepagePreload={handleHomepagePreload}
          handleHomepageNavigation={handleHomepageNavigation}
        />

        <hr />
        <CoinDetailsChart coinDetails={coinDetails} />
      </div>
    </div>
  );
};

export default CoinDetails;
