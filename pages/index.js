import { useEffect } from "react";
import { useState } from "react";
import CoinList from "../components/CoinList";
import SearchBar from "../components/SearchBar";
import styles from "./Home.module.css";

export default function Home({ filteredCoins }) {
  console.log(filteredCoins);
  const [search, setSearch] = useState("");
  const [allCoins, setAllCoins] = useState(
    filteredCoins.filter((coin) => {
      return coin.name.toLowerCase().includes(search.toLowerCase());
    }),
  );

  useEffect(() => {
    setAllCoins(
      filteredCoins.filter((coin) => {
        return coin.name.toLowerCase().includes(search.toLowerCase());
      }),
    );
  }, [search, filteredCoins]);

  const handleChange = (e) => {
    e.preventDefault();
    console.log("change");
    console.log(e.target.value);

    setSearch(e.target.value.toLowerCase());
  };
  return (
    <div className={styles.container}>
      <h1>Home</h1>
      <SearchBar type="text" placeholder="Search" onChange={handleChange} />
      <CoinList filteredCoins={allCoins} />
    </div>
  );
}

export const getServerSideProps = async () => {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=market_cap_desc&per_page=10&page=1&sparkline=false",
  );

  const filteredCoins = await res.json();

  return {
    props: {
      filteredCoins,
    },
  };
};
