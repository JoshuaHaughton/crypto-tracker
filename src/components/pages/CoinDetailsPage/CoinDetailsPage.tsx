"use client";

import styles from "./CoinDetailsPage.module.scss";
import useCoinDetails from "./useCoinDetails";
import CoinInfo from "@/components/UI/CoinInfo/CoinInfo";
import CoinDetailsChart from "@/components/UI/CoinDetailsChart/CoinDetailsChart";
import { IInitialCoinDetailsPageData } from "@/lib/utils/dataFormat.utils";

interface ICoinDetailsPage {
  initialPageData: IInitialCoinDetailsPageData;
}

const CoinDetails = ({ initialPageData }: ICoinDetailsPage) => {
  const { currentSymbol, coinDetails, handleHomepagePreload } = useCoinDetails({
    initialPageData,
  });

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <CoinInfo
          coinAttributes={coinDetails?.coinAttributes}
          currentSymbol={currentSymbol}
          handleHomepagePreload={handleHomepagePreload}
        />

        <hr />
        <CoinDetailsChart coinDetails={coinDetails} />
      </div>
    </div>
  );
};

export default CoinDetails;
