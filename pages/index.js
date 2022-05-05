import { useEffect, useMemo } from "react";
import { useState } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useMediaQuery } from "../src/components/Coins/Coin";
import { useSelector } from "react-redux";

export default function Home({ initialHundredCoins, trendingCoins }) {
  const [filteredCoins, setFilteredCoins] = useState(initialHundredCoins);
  const PageSize = 10;
  console.log("trending", trendingCoins);

  const currentCurrency = useSelector((state) => state.currency.currency);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  // const [allCoins, setAllCoins] = useState(filteredCoins || []);
  // const [carouselCoins, setCarouselCoins] = useState(trendingCoins || []);
  const [carouselCoins, setCarouselCoins] = useState(trendingCoins || []);
  // Isn't changed until after data is fetched, prevents jumpiness in carousel component due to double reload of currencySymbol and carouselCoins
  const [nonReduxSymbol, setNonReduxSymbol] = useState(currentSymbol || "$");
  // const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const currentPageCoins = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return filteredCoins?.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredCoins]);

  const isBreakpoint680 = useMediaQuery(680);
  const isBreakpoint380 = useMediaQuery(380);
  const isBreakpoint1250 = useMediaQuery(1250);

  useEffect(() => {
    //remember to stop this from happening on first render!!!!!!!!!!!!!

    const setNewCurrency = async () => {
      try {
        const urls = [
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
        ];

        // console.log("fetching");
        // const hundredNewCoins = await (
        //   await fetch(
        //     `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        //   )
        // ).json();

        // const trendingCoins = await (
        //   await fetch(
        //     `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
        //   )
        // ).json();

        Promise.all(urls.map((u) => fetch(u)))
          .then((responses) => Promise.all(responses.map((res) => res.json())))
          .then((data) => {
            console.log("yebuddy", data);

            const hundredNewCoins = data[0];
            const trendingCoins = data[1];

            setFilteredCoins(hundredNewCoins);
            setCarouselCoins(trendingCoins);
            setNonReduxSymbol(currentSymbol);
          });

        // console.log(trendingCoins);
        // console.log("hundred new", hundredNewCoins);

        // setFilteredCoins(hundredNewCoins);
        // setCarouselCoins(trendingCoins);
        // setNonReduxSymbol(currentSymbol);
      } catch (err) {
        console.log(err);
      }
    };

    setNewCurrency();
  }, [currentCurrency]);

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

  return (
    <div className={styles.container}>
      <Banner carouselCoins={carouselCoins} nonReduxSymbol={nonReduxSymbol} />
      <h1>Search your favourite crypto!</h1>
      <CoinList
        filteredCoins={filteredCoins}
        currentPageCoins={currentPageCoins}
        isBreakpoint380={isBreakpoint380}
        isBreakpoint680={isBreakpoint680}
        isBreakpoint1250={isBreakpoint1250}
        currentSymbol={currentSymbol}
      />
      <Pagination
        currentPage={currentPage}
        totalCount={filteredCoins?.length}
        pageSize={PageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}

export const getServerSideProps = async () => {

  try {
      const urls = [
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
      ];
    
    
      // const initialHundredCoins = await (
      //   await fetch(
      //     "https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=market_cap_desc&per_page=100&page=1&sparkline=false",
      //   )
      // ).json();
    
    
      // const trendingCoins = await (
      //   await fetch(
      //     `https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
      //   )
      // ).json();
      // console.log(trendingCoins);
    
    
      let initialHundredCoins = null
      let trendingCoins = null
    
    
    
      Promise.all(urls.map((u) => fetch(u)))
              .then((responses) => Promise.all(responses.map((res) => res.json())))
              .then((data) => {
                console.log("yebuddy", data);
    
                initialHundredCoins = data[0];
                trendingCoins = data[1];
              });
    
      return {
        props: {
          initialHundredCoins,
          trendingCoins,
        },
      };
    
  } catch(err) {
    console.log(err);
  }

};
