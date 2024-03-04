"use client";

import CoinInfo from "@/components/UI/CoinInfo/CoinInfo";
import styles from "./CoinDetailsPage.module.scss";
import { selectSelectedCoinDetails } from "@/lib/store/coins/coinsSelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import { isFullCoinDetails } from "@/lib/utils/global.utils";
import { useSelector } from "react-redux";
import CoinDetailsChart from "@/components/UI/CoinDetailsChart/CoinDetailsChart";
import { ICoinDetails } from "@/lib/types/coinTypes";
import { isEmpty } from "lodash";

const CoinDetails = ({
  coinDetails: initialCoinDetails,
}: {
  coinDetails?: ICoinDetails | undefined;
}) => {
  const currentSymbol = useSelector(selectCurrentSymbol);
  const globalCoinDetails = useSelector(selectSelectedCoinDetails);
  const coinDetails =
    !globalCoinDetails || isEmpty(globalCoinDetails)
      ? initialCoinDetails
      : globalCoinDetails;

  // Check if the coin details are fully preloaded
  const isFullyPreloaded = isFullCoinDetails(coinDetails);
  const fullCoinDetails = isFullyPreloaded
    ? (coinDetails as ICoinDetails)
    : null;
  console.warn("INITIAL COINDETAILS ON PAGE", initialCoinDetails);
  console.warn("globalCoinDetails ON PAGE", globalCoinDetails);
  console.warn("FINAL COINDETAILS ON PAGE", coinDetails);
  console.warn("isFullyPreloaded", isFullyPreloaded);

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
