import { memo } from "react";
import Image from "next/image";
import styles from "./Carousel.module.scss";
import { ICoinOverview } from "@/lib/types/coinTypes";
import { BLUR_IMG_URL, TCurrencySymbol } from "@/lib/constants/globalConstants";
import Link from "next/link";

const CAROUSEL_ITEM_IMG_SIZE = 80;

interface ICarouselItemParams {
  coin: ICoinOverview;
  currencySymbol: TCurrencySymbol;
  handleMouseEnter: () => void;
}

/**
 * Component to display a single item within the carousel.
 * It renders the coin's image, symbol, price change, and current price.
 * Additionally, it supports interactivity such as mouse hover and click events.
 *
 * @param coin - The coin data to display.
 * @param currencySymbol - The current currency symbol for price display.
 * @param handleMouseEnter - Function to execute on mouse enter event.
 * @returns A React component representing a single carousel item.
 */
const CarouselItem: React.FC<ICarouselItemParams> = ({
  coin,
  currencySymbol,
  handleMouseEnter,
}) => {
  // Determine if the price change is positive (profit) or negative.
  let isProfit = coin.price_change_percentage_24h >= 0;

  // CSS class for profit/loss indicator based on the coin's price change percentage.
  const priceChangeClass = isProfit ? styles.green : styles.red;

  return (
    <div className={`${styles.carouselItem}`}>
      <Link href={`/coin/${coin.symbol}`}>
        <Image
          src={coin.image}
          alt={coin.name}
          width={CAROUSEL_ITEM_IMG_SIZE}
          height={CAROUSEL_ITEM_IMG_SIZE}
          onMouseEnter={handleMouseEnter}
          quality={100}
          priority
        />
      </Link>
      <h6>{coin.symbol.toUpperCase()}</h6>
      <p>
        {currencySymbol}
        {coin.current_price}
      </p>
      <p className={priceChangeClass}>
        {currencySymbol}
        {coin.price_change_percentage_24h.toFixed(2)}%
      </p>
    </div>
  );
};

export default memo(CarouselItem);
