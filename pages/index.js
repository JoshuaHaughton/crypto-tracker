import { useEffect, useMemo } from "react";
import { useState } from "react";
import CoinList from "../src/components/CoinList";
import SearchBar from "../src/components/SearchBar";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination";
import { TextField } from '@mui/material';
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useMediaQuery } from "../src/components/Coins/Coin";
import { useSelector } from "react-redux";

export default function Home({ initialHundredCoins, trendingCoins }) {
  // console.log(filteredCoins);
  console.log('trendaz', trendingCoins);
  const [filteredCoins, setFilteredCoins] = useState(initialHundredCoins)

  const PageSize = 10;
  // const [allCoins, setAllCoins] = useState(filteredCoins || []);
  const [carouselCoins, setCarouselCoins] = useState(trendingCoins || []);
  // const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  

  const currentPageCoins = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredCoins?.slice(firstPageIndex, lastPageIndex);
  }, [currentPage]);

  const isBreakpoint680 = useMediaQuery(680)
  const isBreakpoint380 = useMediaQuery(380);
  const isBreakpoint1250 = useMediaQuery(1250);

  const currentCurrency = useSelector((state) => state.currency.currency);

  

  useEffect(() => {
    //remember to stop this from happening on first render!!!!!!!!!!!!!

    const setNewCurrency = async () => {
      const hundredNewCoins = await (await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
      )).json();

      const trendingCoins = await (await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`)).json();
    console.log(trendingCoins)

    setFilteredCoins(hundredNewCoins)

    }

    setNewCurrency()




  }, [currentCurrency])


  // useEffect(() => {
  //   if (search !== "") {
  //     let searchedCoins = filteredCoins.filter((coin) => {
  //       return coin.name.toLowerCase().includes(search.toLowerCase());
  //     })
  //     setShownCoins(searchedCoins);
  //   } else {
  //     setShownCoins(currentPageCoins)
  //   }
  // }, [currentPage, search, filteredCoins]);


  const handleChange = (e) => {
    e.preventDefault();
    console.log("change");
    console.log(e.target.value);

    if (e.target.value !== "") {
      let searchedCoins = filteredCoins.slice().filter((coin) => {
        return coin.name.toLowerCase().includes(e.target.value.toLowerCase());
      })

      // useMemo(() => setShownCoins(searchedCoins), []);
      setShownCoins(searchedCoins);
    } else {
      setShownCoins(currentPageCoins)
    }

    // setSearch(e.target.value.toLowerCase());
  };
  return (
    <div className={styles.container}>
      <Banner trendingCoins={carouselCoins} />
      <h1>Search your favourite crypto!</h1>
      <CoinList filteredCoins={filteredCoins} currentPageCoins={currentPageCoins} isBreakpoint380={isBreakpoint380} isBreakpoint680={isBreakpoint680} isBreakpoint1250={isBreakpoint1250}/>
      <Pagination
        currentPage={currentPage}
        totalCount={filteredCoins?.length}
        pageSize={PageSize}
        onPageChange={page => setCurrentPage(page)} />
    </div>
  );
}

export const getServerSideProps = async () => {
  const initialHundredCoins = await (await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=market_cap_desc&per_page=100&page=1&sparkline=false"
  )).json();
  // const trendingCoins = await (await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`)).json();
  
  const trendingCoins = await (await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`)).json();
  console.log(trendingCoins)

  

  return {
    props: {
      initialHundredCoins,
      trendingCoins
    },
  };
};
