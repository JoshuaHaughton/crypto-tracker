import Link from "next/link";
import React from "react";
import styles from "./Coin.module.css";

const Coin = ({
  name,
  price,
  symbol,
  marketcap,
  volume,
  image,
  priceChange,
  id,
}) => {
  return (
    <Link href='/coin/[id]' as={`coin/${id}`} >
      <div className={styles.container}>
          <div className={styles.coin_wrapper}>
            <div className={styles.coin}>
              <img src={image} alt={`${name} image`} className={styles.image} />
              <div className={styles.name_wrapper}>
                <p className={styles.symbol}>{symbol}</p>
                <h1>{name}</h1> 
              </div>

            </div>
          </div>
   
            <p className={styles.price}>${price}</p>
            <p className={styles.volume}>${volume.toLocaleString()}</p>
            {priceChange < 0 ? (
              <p className={styles.red_percent}>{priceChange.toFixed(2)}%</p>
            ) : (
              <p className={styles.green_percent}>{priceChange.toFixed(2)}%</p>
            )}

            <p className={styles.market_cap}>
              Mkt Cap: ${marketcap.toLocaleString()}
            </p>

        </div>
    </Link>
  );
};

export default Coin;
