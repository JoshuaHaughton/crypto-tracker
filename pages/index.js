import CoinList from '../components/CoinList'
import SearchBar from '../components/SearchBar'
import styles from './Home.module.css'

export default function Home({filteredCoins}) {
  console.log(filteredCoins)
  return (
      <div className={styles.container}>
        <h1>Home</h1>
        <SearchBar type="text" placeholder="Search" />
        <CoinList filteredCoins={filteredCoins} />
      </div>
  )
}

export const getServerSideProps = async () => {
  const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=market_cap_desc&per_page=10&page=1&sparkline=false');

  const filteredCoins = await res.json()

  return {
    props: {
      filteredCoins
    }
  }


}
