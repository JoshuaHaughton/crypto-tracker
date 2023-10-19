import { memo } from "react";
import Image from "next/image";
import styles from "./Carousel.module.css";
import { useCoinDetailsPreloader } from "../../../hooks/useCoinDetailsPreloader";

const CarouselCoin = ({ coin, currentSymbol }) => {
  const { id } = coin;
  const { handleMouseEnter, handleCoinClick } = useCoinDetailsPreloader(id);

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
