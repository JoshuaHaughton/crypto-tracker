import { useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useMediaQuery } from "../src/components/Coins/Coin";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../src/store/coins";

export default function Home({ }) {

  const trendingCarouselCoins = useSelector((state) => state.coins.trendingCarouselCoins);
  const coinListCoins = useSelector((state) => state.coins.coinListCoins);
  const dispatch = useDispatch();




  // console.log('da coins mayne', coins)
  const firstRender = useRef(true)
  // const [filteredCoins, setFilteredCoins] = useState(coinListCoins);
  const PageSize = 10;

  let lastSymbol = null;

  const currentCurrency = useSelector((state) => state.currency.currency);
  const currentSymbol = useSelector((state) => state.currency.symbol);

  // Isn't changed until after data is fetched, prevents jumpiness in carousel component due to double reload of currencySymbol and carouselCoins
  const [nonReduxSymbol, setNonReduxSymbol] = useState(currentSymbol || "$");
  // const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const currentPageCoins = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return coinListCoins?.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, coinListCoins]);

  const isBreakpoint680 = useMediaQuery(680);
  const isBreakpoint380 = useMediaQuery(380);
  const isBreakpoint1250 = useMediaQuery(1250);

  useEffect(() => {
    //remember to stop this from happening on first render!!!!!!!!!!!!!

    if(firstRender.current) {
      firstRender.current = false;
      return;
    } else {
        const setNewCurrency = async () => {
          try {
            const urls = [
              `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
              `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
            ];
    
    
            Promise.all(urls.map((u) => fetch(u)))
              .then((responses) => Promise.all(responses.map((res) => res.json())))
              .then((data) => {
                console.log("yebuddy", data);
    
                const hundredNewCoins = data[0];
                const trendingCoins = data[1];

                console.log('latest man', hundredNewCoins)
    
                // updateCoins({initialHundredCoins: hundredNewCoins, trendingCoins});
                console.log('local symbol', currentSymbol)
                setNonReduxSymbol(currentSymbol);
                dispatch(coinsActions.updateCoins({coinListCoins: hundredNewCoins , trendingCarouselCoins: trendingCoins, symbol: currentSymbol}))
                // setCarouselCoins(trendingCoins);
              });

          } catch (err) {
            console.log(err);
          }
        };
    
        setNewCurrency();

    }

  }, [currentCurrency]);



  return (
    <div className={styles.container}>
      <Banner carouselCoins={trendingCarouselCoins} nonReduxSymbol={nonReduxSymbol} />
      <h1>Search your favourite crypto!</h1>
      <CoinList
        filteredCoins={coinListCoins}
        currentPageCoins={currentPageCoins}
        isBreakpoint380={isBreakpoint380}
        isBreakpoint680={isBreakpoint680}
        isBreakpoint1250={isBreakpoint1250}
        currentSymbol={currentSymbol}
      />
      <Pagination
        currentPage={currentPage}
        totalCount={coinListCoins.length}
        pageSize={PageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
