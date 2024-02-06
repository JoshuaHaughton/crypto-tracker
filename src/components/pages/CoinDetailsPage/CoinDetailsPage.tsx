"use client";

import CoinInfo from "@/components/UI/CoinInfo/CoinInfo";
import styles from "./CoinDetailsPage.module.scss";
import CoinInfoSkeleton from "@/components/UI/Skeletons/CoinInfoSkeleton/CoinInfoSkeleton";
import { selectSelectedCoinDetails } from "@/lib/store/coins/coinsSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import { isFullCoinDetails } from "@/utils/global.utils";
import { useSelector } from "react-redux";
import CoinDetailsChart from "@/components/UI/CoinDetailsChart/CoinDetailsChart";
import CoinDetailsChartSkeleton from "@/components/UI/Skeletons/CoinDetailsChart/CoinDetailsChartSkeleton";
import { ICoinDetails } from "@/types/coinTypes";

const CoinDetails = () => {
  const currentSymbol = useSelector(selectCurrentSymbol);
  const coinDetails = useSelector(selectSelectedCoinDetails);
  console.log("COINDETAILS ON PAGE", coinDetails);

  // Check if the coin details are fully preloaded
  const isFullyPreloaded = isFullCoinDetails(coinDetails);
  const fullCoinDetails = isFullyPreloaded
    ? (coinDetails as ICoinDetails)
    : null;

  const coinAttributes = fullCoinDetails?.coinAttributes ?? null;

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <CoinInfo
          coinAttributes={coinAttributes}
          currentSymbol={currentSymbol}
        />

        <hr />
        <CoinDetailsChart coinDetails={fullCoinDetails} />
      </div>
    </div>
  );
};

export default CoinDetails;
