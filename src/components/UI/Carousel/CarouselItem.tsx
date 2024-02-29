import { memo } from "react";
import Image from "next/image";
import styles from "./Carousel.module.scss";
import { ICoinOverview } from "@/lib/types/coinTypes";
import { TCurrencySymbol } from "@/lib/constants/globalConstants";

interface ICarouselItemParams {
  coin: ICoinOverview;
  currencySymbol: TCurrencySymbol;
  showFallback: boolean;
  handleMouseEnter: () => void;
}

/**
 * Component to display a single item within the carousel.
 * It renders the coin's image, symbol, price change, and current price.
 * Additionally, it supports interactivity such as mouse hover and click events.
 *
 * @param coin - The coin data to display.
 * @param currencySymbol - The current currency symbol for price display.
 * @param showFallback - Indicates if the content is loading.
 * @param handleMouseEnter - Function to execute on mouse enter event.
 * @param handleClick - Function to execute on click event.
 * @returns A React component representing a single carousel item.
 */
const CarouselItem: React.FC<ICarouselItemParams> = ({
  coin,
  currencySymbol,
  showFallback,
  handleMouseEnter,
}) => {
  // Determine if the price change is positive (profit) or negative.
  let isProfit = coin.price_change_percentage_24h >= 0;

  // CSS class for profit/loss indicator based on the coin's price change percentage.
  const priceChangeClass = isProfit ? styles.green : styles.red;

  // Apply shimmer effect class if loading.
  const shimmerClass = showFallback ? styles.shimmer : "";

  return (
    <div
      className={`${styles.carouselItem} ${shimmerClass}`}
      onMouseEnter={handleMouseEnter}
    >
      {showFallback ? (
        <div className={`${styles.image} ${shimmerClass}`}></div>
      ) : (
        <Image src={coin.image} alt={coin.name} width={80} height={80} />
      )}
      <p className={shimmerClass}>
        {!showFallback
          ? `${coin.symbol.toUpperCase()} (${currencySymbol}${
              coin.current_price
            })`
          : ""}
      </p>
      {!showFallback && (
        <span className={priceChangeClass}>
          {coin.price_change_percentage_24h.toFixed(2)}%
        </span>
      )}
    </div>
  );
};

export default memo(CarouselItem);
