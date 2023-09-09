import { useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../src/store/coins";

export default function Home({
  coins,
  isBreakpoint380,
  isBreakpoint680,
  isBreakpoint1250,
  currentPage,
  setCurrentPage,
}) {
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
  const vertical = "bottom";
  const horizontal = "center";

  let lastSymbol = null;

  const currentCurrency = useSelector((state) => state.currency.currency);
  const currentSymbol = useSelector((state) => state.currency.symbol);

  // Isn't changed until after data is fetched, prevents jumpiness in carousel component due to double reload of currencySymbol and carouselCoins
  const [nonReduxSymbol, setNonReduxSymbol] = useState(currentSymbol || "$");
  // const [search, setSearch] = useState("");

  const currentPageCoins = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    console.log("coinListCoins", coinListCoins);
    console.log("coins.initialHundredCoins", coins.initialHundredCoins);

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
    if (firstRender.current) {
      firstRender.current = false;
      return;
    } else {
      const setNewCurrency = async () => {
        try {
          const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
          const fetchOptions = {
            headers: {
              Authorization: `Apikey ${apiKey}`,
            },
          };

          console.log(currentCurrency);
          // Fetching the top 100 assets by market cap from CryptoCompare in new currency
          const assetsResponse = await fetch(
            `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=100&tsym=${currentCurrency.toUpperCase()}`,
            fetchOptions,
          );
          const assetsData = await assetsResponse.json();

          const initialHundredCoins = assetsData.Data.map((entry, i) => {
            const coin = entry.CoinInfo;
            const metrics = entry.RAW?.CAD; // Notice the change from USD to CAD
            if (!metrics) {
              console.warn(`Metrics not found for coin: ${coin.Name}`);
              return null;
            }

            return {
              id: coin.Name,
              symbol: coin.Name,
              name: coin.FullName,
              image: `https://cryptocompare.com${coin.ImageUrl}`,
              current_price: metrics.PRICE,
              current_price_USD: metrics.PRICE / rates.CAD, // Convert CAD to USD for the client-side option
              current_price_AUD: (metrics.PRICE / rates.CAD) * rates.AUD, // Convert from CAD to USD first, then to AUD
              current_price_GBP: (metrics.PRICE / rates.CAD) * rates.GBP, // Convert from CAD to USD first, then to GBP
              market_cap: metrics.MKTCAP,
              market_cap_rank: i + 1,
              total_volume: metrics.TOTALVOLUME24HTO,
              high_24h: metrics.HIGH24HOUR,
              low_24h: metrics.LOW24HOUR,
              price_change_24h: metrics.CHANGE24HOUR,
              price_change_percentage_24h: metrics.CHANGEPCT24HOUR,
              circulating_supply: metrics.SUPPLY,
            };
          }).filter(Boolean);

          const trendingCoins = initialHundredCoins.slice(0, 10);

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
      window.scrollTo(0, 448);
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
