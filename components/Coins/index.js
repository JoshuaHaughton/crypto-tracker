import React from 'react'
import styles from './Coins.module.css'

const Coin = ({ name, price, symbol, marketcap, volume, image, priceChange, id }) => {

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.coin}>
          <img src={image} alt={`${name} image`} className={styles.image} />
          <h1>{name}</h1>
          <p className={styles.symbol}>{symbol}</p>
        </div>
        <div className={styles.data}>
          <p className={styles.price}>${price}</p>
          <p className={styles.volume}>${volume.toLocaleString()}</p>
          {priceChange < 0 ? (
            <p className={styles.red_percent}>{priceChange.toFixed(2)}%</p>
          ) : (
            <p className={styles.green_percent}>{priceChange.toFixed(2)}%</p>
          )
          }

          <p className={styles.market_cap}>
            Mkt Cap: ${marketcap.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Coin