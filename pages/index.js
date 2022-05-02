import { useEffect, useMemo } from "react";
import { useState } from "react";
import CoinList from "../components/CoinList";
import SearchBar from "../components/SearchBar";
import Banner from "../components/UI/Banner/Banner";
import Pagination from "../components/UI/Pagination";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";

export default function Home({ filteredCoins, trendingCoins }) {
  console.log(filteredCoins);
  console.log('trendaz', trendingCoins);
  const PageSize = 10;
  const [carouselCoins, setCarouselCoins] = useState(trendingCoins || []);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [shownCoins, setShownCoins] = useState(
    filteredCoins.slice(0, PageSize)
  );

  const currentPageCoins = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredCoins.slice(firstPageIndex, lastPageIndex);
  }, [currentPage]);

  useEffect(() => {
    if (search !== "") {
      setShownCoins(
        filteredCoins.filter((coin) => {
          return coin.name.toLowerCase().includes(search.toLowerCase());
        }),
      );
    } else {
      setShownCoins(currentPageCoins)
    }
  }, [currentPage, search, filteredCoins]);


  const handleChange = (e) => {
    e.preventDefault();
    console.log("change");
    console.log(e.target.value);

    setSearch(e.target.value.toLowerCase());
  };
  return (
    <div className={styles.container}>
      <Banner trendingCoins={carouselCoins} />
      <h1>Search your favourite crypto!</h1>
      <SearchBar type="text" placeholder="Search your favourite cryptocurrency" onChange={handleChange} />
      <CoinList filteredCoins={shownCoins} />
      <Pagination
        currentPage={currentPage}
        totalCount={filteredCoins.length}
        pageSize={PageSize}
        onPageChange={page => setCurrentPage(page)} />
    </div>
  );
}

export const getServerSideProps = async () => {
  const filteredCoins = await (await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=market_cap_desc&per_page=100&page=1&sparkline=false"
  )).json();
  // const trendingCoins = await (await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`)).json();
  
  const trendingCoins = await (await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`)).json();
  console.log(trendingCoins)

  

  return {
    props: {
      filteredCoins,
      trendingCoins
    },
  };
};
