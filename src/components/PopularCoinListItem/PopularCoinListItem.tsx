import Image from "next/image";
import styles from "./PopularCoinListItem.module.scss";
import { useCoinDetailsPreloader } from "@/lib/hooks/preloaders/useCoinDetailsPreloader";
import { IDisplayedCoinOverview } from "@/types/coinTypes";

const PopularCoinListItem = ({
  name,
  symbol,
  image,
  current_price,
  total_market_cap,
  volume_24h,
  price_change_percentage_24h,
  currentCurrencySymbol,
}: IDisplayedCoinOverview) => {
  const { handleMouseEnter, handleCoinClick } = useCoinDetailsPreloader(symbol);

  return (
    <tr
      className={styles.itemRow}
      onMouseEnter={handleMouseEnter}
      onClick={handleCoinClick}
    >
      <td>
        <div className={styles.coin}>
          <figure className={styles.coin__image_wrapper}>
            <Image src={image} height={38} width={38} alt={`${name} image`} />
          </figure>
          <div className={styles.coin__info}>
            <p className={styles.symbol}>{symbol}</p>
            <h3>{name}</h3>
          </div>
        </div>
      </td>
      <td>
        {currentCurrencySymbol}
        {current_price.toLocaleString("en-US", {
          maximumFractionDigits: 8,
          minimumFractionDigits: 2,
        })}
      </td>
      <td>
        {volume_24h !== "0" && volume_24h
          ? `${currentCurrencySymbol} ${volume_24h}`
          : "Info Missing"}
      </td>
      <td
        className={
          price_change_percentage_24h < 0
            ? styles.redPercent
            : styles.greenPercent
        }
      >
        {price_change_percentage_24h.toFixed(2)}%
      </td>
      <td>
        {total_market_cap ? `${currentCurrencySymbol} ${total_market_cap}` : ""}
      </td>
    </tr>
  );
};

export default PopularCoinListItem;
