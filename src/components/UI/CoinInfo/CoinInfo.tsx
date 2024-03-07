import styles from "./CoinInfo.module.scss";
import { ICoinDetailAttributes } from "@/lib/types/coinTypes";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Image from "next/image";
import CoinInfoSkeleton from "../Skeletons/CoinInfoSkeleton/CoinInfoSkeleton";
import { formatBigNumber } from "@/lib/utils/dataFormat.utils";

const removeHTML = (str: string) => str.replace(/<\/?[^>]+(>|$)/g, "");

/**
 * Props for the CoinInfo component.
 */
export interface ICoinInfoProps {
  coinAttributes: ICoinDetailAttributes;
  currentSymbol: string;
  handleHomepagePreload: () => void;
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
  handleHomepagePreload,
}: ICoinInfoProps): JSX.Element => {
  return (
    <div className={styles.coin_info}>
      <Link href="/" className={styles.back_link}>
        <FontAwesomeIcon
          icon={faArrowLeft}
          onMouseEnter={handleHomepagePreload}
        />
      </Link>
      <header className={styles.header}>
        <div className={styles.title_wrapper}>
          <Image
            src={coinAttributes.image}
            alt={coinAttributes.name}
            width={88}
            height={88}
            className={styles.image}
            quality={100}
            priority
          />

          <h1 className={styles.name}>{coinAttributes.name}</h1>
          <h4 className={styles.symbol}>{coinAttributes.symbol}</h4>
        </div>
        <div className={styles.description}>
          <p>
            {coinAttributes?.description?.length > 2
              ? coinAttributes?.description.split(".").length > 2
                ? `${removeHTML(coinAttributes.description)
                    .split(".")
                    .slice(0, 2)
                    .join(". ")}.`
                : `${removeHTML(coinAttributes.description).slice(0, 170)}...`
              : "none"}
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
            {formatBigNumber(coinAttributes.total_market_cap)}
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
