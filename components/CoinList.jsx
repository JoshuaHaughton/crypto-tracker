import React from 'react'
import Coin from './Coins/Coin'
import styles from './CoinList.module.css'


const CoinList = ({filteredCoins}) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.name_header}>
          <p>Name</p>
        </div>
        <div className={styles.price_header}>
          <p>Price</p>
        </div>
        <div className={styles.volume_header}>
          <p>Volume</p>
        </div> 
        <div className={styles.dayChange_header}>
          <p>24 Hr Change</p>
        </div>
        <div className={styles.marketCap_header}>
          <p>Market Cap</p>
        </div>
      </header>
      {filteredCoins.map(coin => {
        return (
          <Coin 
            key={coin.id}
            name={coin.name}
            id={coin.id}
            price={coin.current_price}
            symbol={coin.symbol}
            marketcap={coin.market_cap}
            volume={coin.total_volume}
            image={coin.image}
            priceChange={coin.price_change_percentage_24h}
          />
        )
      })}
    </div>
  )
}

export default CoinList