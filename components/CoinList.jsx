import React, { useState, useCallback, useEffect } from 'react'
import Coin, { useMediaQuery } from './Coins/Coin'
import styles from './CoinList.module.css'



const bigNumberFormatter = (num) => {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(1) + "K"; // convert to K for numbers > 1000 < 1 million
  } else if (num > 1000000 && num < 1000000000) {
    return (num / 1000000).toFixed(1) + "M"; // convert to M for numbers > 1 million
  } else if (num > 1000000000 && num < 1000000000000) {
    return (num / 1000000000).toFixed(1) + "B"; // convert to B for numbers > 1 billion
  } else if (num > 1000000000000) {
    return (num / 1000000000000).toFixed(1) + "T"; // convert to T for numbers > 1 trillion
  } else if (num <= 999) {
    return num; // if value < 1000, nothing to do
  }
};

const CoinList = ({ filteredCoins }) => {

  const isBreakpoint680 = useMediaQuery(680)
  const isBreakpoint300 = useMediaQuery(300)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.name_header}>
          <p>Name</p>
        </div>
        {!isBreakpoint300 && 
          <div className={styles.price_header}>
            <p>Price</p>
          </div>
        }
        {!isBreakpoint680 && <div className={styles.volume_header}>
          <p>Volume</p>
        </div>  }

        {!isBreakpoint300 && <div className={styles.dayChange_header}>
          <p>24 Hr Change</p>
        </div>}
        
        
        {!isBreakpoint680 && <div className={styles.marketCap_header}>
          <p>Market Cap</p>
        </div>}
      </header>
      {filteredCoins.map(coin => {
        // let transformedMarketCap = null
        // let transformedVolume = null

        // if (isBreakpoint) {
        //   transformedMarketCap = coin.market_cap.toLocaleString();
        //   transformedVolume = coin.total_volume.toLocaleString();
        // } else {
        //   transformedMarketCap = bigNumberFormatter(coin.market_cap)
        //   transformedVolume = bigNumberFormatter(coin.total_volume)
        // }

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