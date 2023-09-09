import { useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../src/store/coins";
import { convertCurrency } from "./coin/[id]";

export default function Home({
  coins,
  rates,
  isBreakpoint380,
  isBreakpoint680,
  isBreakpoint1250,
  currentPage,
  setCurrentPage,
}) {
  const trendingCarouselCoins = useSelector(
    (state) => state.coins.trendingCarouselCoins,
  );
  const coinListCoins = useSelector((state) => state.coins.coinListCoins);

  const dispatch = useDispatch();

  const firstRender = useRef(true);
  const isHydrated = useRef(false);
  const PageSize = 10;

  const cachedCurrency = useSelector((state) => state.currency.cachedCurrency);
  const currentCurrency = useSelector((state) => state.currency.currency);
  const currentSymbol = useSelector((state) => state.currency.symbol);

  // Isn't changed until after data is fetched, prevents jumpiness in carousel component due to double reload of currencySymbol and carouselCoins
  const [nonReduxSymbol, setNonReduxSymbol] = useState(currentSymbol || "$");

  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }

    if (firstRender.current) {
      if (coinListCoins.length === 0) {
        console.log("empty dispatch");
        dispatch(
          coinsActions.updateCoins({
            coinListCoins: coins.initialHundredCoins,
            trendingCarouselCoins: coins.trendingCoins,
            symbol: currentSymbol,
          }),
        );
      }
      firstRender.current = false;
    } else {
      const setNewCurrency = () => {
        console.log("setNewCurrency");
        const updatedCurrencyCoins = coinListCoins
          .map((coin, i) => {
            return {
              ...coin,
              current_price: convertCurrency(
                coin.current_price,
                cachedCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                rates,
              ),
              market_cap: convertCurrency(
                coin.market_cap,
                cachedCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                rates,
              ),
              market_cap_rank: i + 1,
              total_volume: convertCurrency(
                coin.total_volume,
                cachedCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                rates,
              ),
              high_24h: convertCurrency(
                coin.high_24h,
                cachedCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                rates,
              ),
              low_24h: convertCurrency(
                coin.low_24h,
                cachedCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                rates,
              ),
              price_change_24h: convertCurrency(
                coin.price_change_24h,
                cachedCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                rates,
              ),
            };
          })
          .filter(Boolean);

        const trendingCoins = updatedCurrencyCoins.slice(0, 10);

        setNonReduxSymbol(currentSymbol);
        dispatch(
          coinsActions.updateCoins({
            coinListCoins: updatedCurrencyCoins,
            trendingCarouselCoins: trendingCoins,
            symbol: currentSymbol,
          }),
        );
      };

      setNewCurrency();
    }
  }, [currentCurrency]);

  useEffect(() => {
    if (currentPage !== 1) {
      window.scrollTo(0, 448);
    }
  }, []);

  const currentPageCoins = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;

    if (coinListCoins.length < 1) {
      return coins.initialHundredCoins.slice(firstPageIndex, lastPageIndex);
    } else {
      return coinListCoins?.slice(firstPageIndex, lastPageIndex);
    }
  }, [currentPage, coinListCoins]);

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

export async function getServerSideProps(context) {
  const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: {
      Authorization: `Apikey ${apiKey}`,
    },
  };

  try {
    // Fetching all available rates from CryptoCompare's price multi-full endpoint for CAD
    const exchangeRateResponse = await fetch(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=CAD&tsyms=USD,AUD,GBP`,
      fetchOptions,
    );
    const exchangeData = await exchangeRateResponse.json();

    const rates = {
      CAD: {
        CAD: 1,
        USD: exchangeData.RAW.CAD.USD.PRICE,
        AUD: exchangeData.RAW.CAD.AUD.PRICE,
        GBP: exchangeData.RAW.CAD.GBP.PRICE,
      },
      USD: {
        CAD: 1 / exchangeData.RAW.CAD.USD.PRICE,
        USD: 1,
        AUD: exchangeData.RAW.CAD.AUD.PRICE / exchangeData.RAW.CAD.USD.PRICE,
        GBP: exchangeData.RAW.CAD.GBP.PRICE / exchangeData.RAW.CAD.USD.PRICE,
      },
      AUD: {
        CAD: 1 / exchangeData.RAW.CAD.AUD.PRICE,
        USD: exchangeData.RAW.CAD.USD.PRICE / exchangeData.RAW.CAD.AUD.PRICE,
        AUD: 1,
        GBP: exchangeData.RAW.CAD.GBP.PRICE / exchangeData.RAW.CAD.AUD.PRICE,
      },
      GBP: {
        CAD: 1 / exchangeData.RAW.CAD.GBP.PRICE,
        USD: exchangeData.RAW.CAD.USD.PRICE / exchangeData.RAW.CAD.GBP.PRICE,
        AUD: exchangeData.RAW.CAD.AUD.PRICE / exchangeData.RAW.CAD.GBP.PRICE,
        GBP: 1,
      },
    };

    // Fetching the top 100 assets by market cap from CryptoCompare in CAD
    const assetsResponse = await fetch(
      "https://min-api.cryptocompare.com/data/top/mktcapfull?limit=100&tsym=CAD",
      fetchOptions,
    );
    const assetsData = await assetsResponse.json();

    const initialHundredCoins = assetsData.Data.map((entry, i) => {
      const coin = entry.CoinInfo;
      const metrics = entry.RAW?.CAD;
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
    console.log(initialHundredCoins[0]);

    return {
      props: {
        coins: {
          initialHundredCoins,
          trendingCoins,
        },
        rates,
      },
    };
  } catch (err) {
    console.log(err);
  }
}
