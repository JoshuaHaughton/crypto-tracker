import { memo } from "react";
import Image from "next/image";
import styles from "./Carousel.module.scss";
import { useCoinDetailsPreloader } from "@/lib/hooks/preloaders/useCoinDetailsPreloader";
import { ICoinOverview } from "@/types/coinTypes";
import { TCurrencySymbol } from "@/lib/constants/globalConstants";

/**
 * Props for CarouselCoin component.
 */
interface CarouselCoinProps {
  coin: ICoinOverview;
  currentSymbol: TCurrencySymbol;
}

/**
 * Displays a single coin within the carousel.
 * It shows the coin's image, symbol, price change, and current price.
 * Provides interactivity for mouse hover and click events.
 *
 * @param props - The props for the component.
 * @returns The CarouselCoin component.
 */
const CarouselCoin = ({ coin, currentSymbol }: CarouselCoinProps) => {
  const id = coin.symbol;
  const { handleMouseEnter, handleCoinClick } = useCoinDetailsPreloader(id);

  // Determine if the price change is positive (profit) or negative.
  let profit = coin.price_change_percentage_24h >= 0;

  return (
    <div
      className={styles.carousel_item}
      onMouseEnter={handleMouseEnter}
      onClick={handleCoinClick}
    >
      <Image src={coin.image} alt={coin.name} height={80} width={80} priority />
      <p>
        {coin?.symbol.toUpperCase()}&nbsp;
        {profit ? (
          <span className={styles.green}>
            +
            {coin.price_change_percentage_24h.toLocaleString("en-US", {
              maximumFractionDigits: 5,
              minimumFractionDigits: 2,
            })}
            %
          </span>
        ) : (
          <span className={styles.red}>
            {coin.price_change_percentage_24h.toLocaleString("en-US", {
              maximumFractionDigits: 5,
              minimumFractionDigits: 2,
            })}
            %
          </span>
        )}
      </p>
      <h6>
        {currentSymbol}
        {coin?.current_price.toLocaleString("en-US", {
          maximumFractionDigits: 8,
          minimumFractionDigits: 2,
        })}
      </h6>
    </div>
  );
};

export default memo(CarouselCoin);
