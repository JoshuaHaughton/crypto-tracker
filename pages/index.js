import { useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../src/store/coins";

export default function Home({ coins, isBreakpoint380, isBreakpoint680, isBreakpoint1250, currentPage, setCurrentPage }) {
  // const [openNotificationBar, setOpenNotificationBar] = useState(false);

  const trendingCarouselCoins = useSelector(
    (state) => state.coins.trendingCarouselCoins,
  );
  const coinListCoins = useSelector((state) => state.coins.coinListCoins);
  
  const dispatch = useDispatch();

  // console.log('da coins mayne', coins)
  const firstRender = useRef(true);
  // const [filteredCoins, setFilteredCoins] = useState(coinListCoins);
  const PageSize = 10;
  const vertical = 'bottom'
  const horizontal = 'center'

  let lastSymbol = null;

  const currentCurrency = useSelector((state) => state.currency.currency);
  const currentSymbol = useSelector((state) => state.currency.symbol);

  // Isn't changed until after data is fetched, prevents jumpiness in carousel component due to double reload of currencySymbol and carouselCoins
  const [nonReduxSymbol, setNonReduxSymbol] = useState(currentSymbol || "$");
  // const [search, setSearch] = useState("");

  const currentPageCoins = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;

    if (coinListCoins.length < 1) {
      return coins.initialHundredCoins.slice(firstPageIndex, lastPageIndex);
    } else {
      return coinListCoins?.slice(firstPageIndex, lastPageIndex);
    }
  }, [currentPage, coinListCoins]);

  // const isBreakpoint680 = useMediaQuery(680);
  // const isBreakpoint380 = useMediaQuery(380);
  // const isBreakpoint1250 = useMediaQuery(1250);

  useEffect(() => {
    //remember to stop this from happening on first render!!!!!!!!!!!!!
    if (firstRender.current) {
      firstRender.current = false;
      return;
    } else {
      const setNewCurrency = async () => {
        try {
          // setOpenNotificationBar(true);
          const urls = [
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
          ];

          Promise.all(urls.map((u) => fetch(u)))
            .then((responses) =>
              Promise.all(responses.map((res) => res.json())),
            )
            .then((data) => {
              // console.log("yebuddy", data);

              const hundredNewCoins = data[0];
              const trendingCoins = data[1];

              // console.log("latest man", hundredNewCoins);

              // updateCoins({initialHundredCoins: hundredNewCoins, trendingCoins});
              // console.log("local symbol", currentSymbol);
              setNonReduxSymbol(currentSymbol);
              dispatch(
                coinsActions.updateCoins({
                  coinListCoins: hundredNewCoins,
                  trendingCarouselCoins: trendingCoins,
                  symbol: currentSymbol,
                }),
              );
              // setOpenNotificationBar(false);
              // setCarouselCoins(trendingCoins);
            });
        } catch (err) {
          console.log(err);
        }
      };

      setNewCurrency();
    }
  }, [currentCurrency]);

  // useEffect(() => {
  //   if (firstRender.current) {
  //     firstRender.current = false;
  //     return;
  //   } else {

  //   }
  // }, [currentPage]);  
  
  useEffect(() => {
    if (currentPage !== 1) {
      window.scrollTo(0, 448)
    }
  }, []);


  return (
    <div className={styles.container}>
      <Banner
        carouselCoins={
          trendingCarouselCoins.length > 1
            ? trendingCarouselCoins
            : coins.trendingCoins
        }
        nonReduxSymbol={nonReduxSymbol}
      />
      <h2>Crypto Prices</h2>
      <CoinList
        filteredCoins={
          coinListCoins.length > 1 ? coinListCoins : coins.initialHundredCoins
        }
        currentPageCoins={currentPageCoins}
        isBreakpoint380={isBreakpoint380}
        isBreakpoint680={isBreakpoint680}
        isBreakpoint1250={isBreakpoint1250}
        currentSymbol={currentSymbol}
      />
      <Pagination
        currentPage={currentPage}
        totalCount={100}
        pageSize={10}
        onPageChange={(page) => setCurrentPage(page)}
      />
      {/* <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={openNotificationBar}
        onClose={() => setOpenNotificationBar(false)}
        message="Retrieving New Currency..."
        key={vertical + horizontal}
        ContentProps={{
          classes: {
            root: 'errorClass'
          }
        }}
      /> */}
    </div>
  );
}
