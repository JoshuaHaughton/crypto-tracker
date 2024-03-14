import { memo } from "react";
import Image from "next/image";
import styles from "./PopularCoinsListItem.module.scss";
import {
  IDisplayedCoinOverview,
  IPopularCoinMatchDetails,
} from "@/lib/types/coinTypes";
import HighlightMatchedText from "../../HighlightMatchedText/HighlightMatchedText";

const LIST_ITEM_IMG_SIZE = 38;

/**
 * Props for the PopularCoinListItem component.
 * @interface IPopularCoinListItemProps
 * @property {IDisplayedCoinOverview} coin - The coin data to display in the list item.
 */
interface IPopularCoinListItemProps {
  coin: IDisplayedCoinOverview;
  matchDetails: IPopularCoinMatchDetails | undefined;
  handleMouseEnter: () => void;
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
  matchDetails,
  handleMouseEnter,
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

  // Apply highlighting based on match details if necessary
  const renderedName = matchDetails?.nameMatches ? (
    <HighlightMatchedText
      text={name}
      match={matchDetails.nameMatches}
      styles={styles}
    />
  ) : (
    name
  );

  const renderedSymbol = matchDetails?.symbolMatches ? (
    <HighlightMatchedText
      text={symbol}
      match={matchDetails.symbolMatches}
      styles={styles}
    />
  ) : (
    symbol
  );

  // Determine the CSS class based on the price change percentage (red for negative, green for positive).
  const priceChangeClass = price_change_percentage_24h.startsWith("-")
    ? styles.redPercent
    : styles.greenPercent;

  // Render the table row with coin details.
  return (
    <tr
      className={styles.item}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      <td className={styles.coinCell}>
        <div className={styles.coin}>
          <div className={styles.coinInfo}>
            <figure className={styles.coinInfoImageWrapper}>
              <Image
                src={image}
                height={LIST_ITEM_IMG_SIZE}
                width={LIST_ITEM_IMG_SIZE}
                alt={`${name} image`}
                quality={100}
                priority
              />
            </figure>
            <span className={styles.coinSymbol}>{renderedSymbol}</span>
            <h3 className={styles.coinName}>{renderedName}</h3>
          </div>

          <div className={styles.coinMobileStats}>
            <p className={styles.itemPriceMobile}>
              <b>Price:</b> <br />
              {currentCurrencySymbol}
              {current_price}
            </p>
            <p
              className={`${styles.itemDayPriceChangeMobile} ${priceChangeClass}`}
            >
              <b>24hr Change:</b> <br />
              {price_change_percentage_24h}
            </p>
          </div>
        </div>
      </td>
      <td className={styles.itemPrice}>
        {currentCurrencySymbol}
        {current_price}
      </td>
      <td className={styles.itemDayVolume}>
        {currentCurrencySymbol}
        {volume_24h}
      </td>
      <td className={`${styles.itemDayPriceChange} ${priceChangeClass}`}>
        {price_change_percentage_24h}
      </td>
      <td className={styles.itemMarketCap}>
        {currentCurrencySymbol}
        {total_market_cap}
      </td>
    </tr>
  );
};

// Using React.memo to prevent unnecessary re-renders when props have not changed.
export default memo(PopularCoinListItem);
