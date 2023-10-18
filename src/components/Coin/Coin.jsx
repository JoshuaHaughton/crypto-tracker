import Image from "next/image";
import styles from "./Coin.module.css";
import { useCoinDetailsPreloader } from "../../hooks/useCoinDetailsPreloader";

const Coin = ({
  name,
  price,
  symbol,
  marketcap,
  volume,
  image,
  priceChange,
  id,
  coinSymbol,
}) => {
  const { handleMouseEnter, handleCoinClick } = useCoinDetailsPreloader(id);

  return (
    <div
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onClick={handleCoinClick}
    >
      <div className={styles.coin_wrapper}>
        <div className={styles.coin}>
          <figure className={styles.image_wrapper}>
            <Image
              src={image}
              height={38}
              width={38}
              alt={`${name} image`}
              className={styles.image}
            />
          </figure>
          <div className={styles.name_wrapper}>
            <p className={styles.symbol}>{symbol}</p>
            <h1>{name}</h1>
          </div>
        </div>
      </div>

      <p className={styles.price}>
        {coinSymbol}{" "}
        {price.toLocaleString("en-US", {
          maximumFractionDigits: 8,
          minimumFractionDigits: 2,
        })}
      </p>

      {volume !== 0 && volume && (
        <p className={styles.volume}>
          {coinSymbol} {volume}
        </p>
      )}
      {volume === 0 && <p className={styles.volume}>Info Missing</p>}

      {priceChange < 0 ? (
        <p className={styles.red_percent}>{priceChange.toFixed(2)}%</p>
      ) : (
        <p className={styles.green_percent}>{priceChange.toFixed(2)}%</p>
      )}

      {marketcap && (
        <p className={styles.market_cap}>
          {coinSymbol} {marketcap}
        </p>
      )}
    </div>
  );
};

export default Coin;
