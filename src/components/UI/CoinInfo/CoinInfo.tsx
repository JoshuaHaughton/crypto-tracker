import styles from "./CoinInfo.module.scss";
import { ICoinDetailAttributes } from "@/types/coinTypes";
import { removeHTML, bigNumberFormatter } from "@/utils/global.utils";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Image from "next/image";
import CoinInfoSkeleton from "../Skeletons/CoinInfoSkeleton/CoinInfoSkeleton";

/**
 * Props for the CoinInfo component.
 */
export interface ICoinInfoProps {
  coinAttributes: ICoinDetailAttributes | null;
  currentSymbol: string;
}

/**
 * Displays information about a cryptocurrency.
 *
 * @param {ICoinInfoProps} props - Props containing coin attributes and current symbol.
 * @returns {JSX.Element} - The rendered component.
 */
const CoinInfo: React.FC<ICoinInfoProps> = ({
  coinAttributes,
  currentSymbol,
}: ICoinInfoProps): JSX.Element => {
  // Handle loading state or incomplete data
  if (!coinAttributes) {
    // Render skeleton component
    return (
      <CoinInfoSkeleton
        coinAttributes={coinAttributes}
        currentSymbol={currentSymbol}
      />
    );
  }

  return (
    <div className={styles.coin_info}>
      <Link href="/" passHref className={styles.back_link}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </Link>
      <header className={styles.header}>
        <div className={styles.title_wrapper}>
          <Image
            src={coinAttributes.image}
            alt={coinAttributes.name}
            width={88}
            height={88}
            className={styles.image}
          />

          <h1 className={styles.name}>{coinAttributes.name}</h1>
          <h4 className={styles.symbol}>
            {coinAttributes.symbol.toUpperCase()}
          </h4>
        </div>
        <div className={styles.description}>
          <p>
            {coinAttributes.description.split(".").length > 2
              ? `${removeHTML(coinAttributes.description)
                  .split(".")
                  .slice(0, 2)
                  .join(". ")}.`
              : `${removeHTML(coinAttributes.description).slice(0, 170)}...`}
          </p>
        </div>
      </header>

      <div className={styles.info_card}>
        <div className={styles.info_row}>
          <h3>Current Price:</h3>
          <p className={styles.current}>
            {currentSymbol}
            {coinAttributes.current_price.toLocaleString("en-US", {
              maximumFractionDigits: 8,
            })}
          </p>
        </div>

        <div className={styles.info_row}>
          <h3>Market Cap:</h3>
          <p className={styles.current}>
            {currentSymbol}
            {bigNumberFormatter(coinAttributes.total_market_cap)}
          </p>
        </div>

        <div className={styles.info_row}>
          <h3>24h Price Change:</h3>
          {+coinAttributes?.price_change_24h > 0 ? (
            <p className={styles.current}>
              {+coinAttributes?.price_change_24h < 1 &&
                `${currentSymbol}${coinAttributes?.price_change_24h}`}
              {+coinAttributes?.price_change_24h > 1 &&
                `${currentSymbol}${coinAttributes?.price_change_24h.toFixed(
                  2,
                )}`}
            </p>
          ) : (
            <p className={styles.current}>
              {+coinAttributes?.price_change_24h < -1 &&
                `${currentSymbol}${coinAttributes?.price_change_24h.toLocaleString()}`}
              {+coinAttributes?.price_change_24h > -1 &&
                `- ${currentSymbol}${Math.abs(
                  coinAttributes?.price_change_24h,
                ).toFixed(8)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinInfo;