import { memo } from "react";
import Image from "next/image";
import styles from "./PopularCoinsListItem.module.scss";
import { IDisplayedCoinOverview } from "@/lib/types/coinTypes";

/**
 * Props for the PopularCoinListItem component.
 * @interface IPopularCoinListItemProps
 * @property {IDisplayedCoinOverview} coin - The coin data to display in the list item.
 */
interface IPopularCoinListItemProps {
  coin: IDisplayedCoinOverview;
  handleHover: () => void;
  handleClick: () => void;
}

/**
 * Represents a row in the list of popular coins, displaying details such as
 * the coin's image, name, symbol, current price, volume, price change percentage,
 * and total market cap. Additionally, this component handles mouse enter and click
 * events for preloading coin details.
 *
 * @param {IPopularCoinListItemProps} props - Component properties including the coin details.
 * @returns {JSX.Element} The table row element populated with the coin data.
 */
const PopularCoinListItem: React.FC<IPopularCoinListItemProps> = ({
  coin,
  handleHover,
  handleClick,
}: IPopularCoinListItemProps): JSX.Element => {
  const {
    symbol,
    image,
    name,
    current_price,
    total_market_cap,
    volume_24h,
    price_change_percentage_24h,
    currentCurrencySymbol,
  } = coin;

  // Determine the CSS class based on the price change percentage (red for negative, green for positive).
  const priceChangeClass = price_change_percentage_24h.startsWith("-")
    ? styles.redPercent
    : styles.greenPercent;

  // Render the table row with coin details.
  return (
    <tr
      className={styles.itemRow}
      onMouseEnter={handleHover}
      onClick={handleClick}
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
        {current_price}
      </td>
      <td>{volume_24h}</td>
      <td className={priceChangeClass}>{price_change_percentage_24h}</td>
      <td>{total_market_cap}</td>
    </tr>
  );
};

// Using React.memo to prevent unnecessary re-renders when props have not changed.
export default memo(PopularCoinListItem);
