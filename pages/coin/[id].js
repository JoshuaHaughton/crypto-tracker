import React from 'react'
import styles from './Coin.module.css'
const Coin = ({ coin }) => {
  console.log(coin)
  return (
    <div className={styles.container}>
      <div className={styles.coin_container}>
        <img src={coin.image.large} alt={coin.name} className={styles.img} />
        <h1 className={styles.name}>{coin.name}</h1>
        <p className={styles.symbol}>{coin.symbol.toUpperCase()}</p>
        <p className={styles.current}>${coin.market_data.current_price.usd}</p>
      </div>
    </div>
  )
}

export default Coin

export async function getServerSideProps(context) {
  const {id} = context.query;

  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`)

  const data = await res.json();
  console.log(data);

  return {
    props: {
      coin: data
    }
  }
}