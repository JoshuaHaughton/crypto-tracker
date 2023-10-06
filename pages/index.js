import { useEffect } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useSelector } from "react-redux";
import { initialCoinsState } from "../src/store/coins";
import { initialCurrencyState } from "../src/store/currency";
import { fetchDataForCoinListCacheInitialization } from "../src/utils/api.utils";
import { FIVE_MINUTES_IN_MS } from "../src/global/constants";

export default function Home() {
  const coinListPageNumber = useSelector(
    (state) => state.appInfo.coinListPageNumber,
  );

  useEffect(() => {
    if (coinListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, [coinListPageNumber]);

  return (
    <div className={styles.container}>
      <Banner />
      <h2>Crypto Prices</h2>
      <CoinList />
      <Pagination />
    </div>
  );
}

export async function getServerSideProps(context) {
  const currentTimestamp = Date.now();
  const newGlobalCacheVersion = currentTimestamp.toString();

  // Retrieve the currency from the request cookies
  const currentCurrency =
    context.req.cookies.currentCurrency || initialCurrencyState.currentCurrency;

  // Retrieve the global cache version from cookies or set it to a very old timestamp
  const lastFetchedTimestamp = parseInt(
    context.req.cookies.globalCacheVersion || "0",
  );

  // Determine if we should fetch the data again
  const shouldFetchData =
    context.req.headers["x-fetched-currency"] !== currentCurrency ||
    currentTimestamp - lastFetchedTimestamp >= FIVE_MINUTES_IN_MS;

  let initialReduxState;

  if (shouldFetchData) {
    // Set the currency in the cache header, so we can check it in future requests
    context.res.setHeader("x-fetched-currency", currentCurrency);

    try {
      initialReduxState = await fetchDataForCoinListCacheInitialization(
        currentCurrency,
      );
    } catch (err) {
      console.log(err);
      // Return default or placeholder data to prevent breaking the site
      initialReduxState = {
        coins: initialCoinsState,
        currency: {
          ...initialCurrencyState,
          currentCurrency,
          symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
        },
      };
    }
  }

  // Set Cache-Control header for 5 minutes
  context.res.setHeader(
    "Cache-Control",
    "s-maxage=300, stale-while-revalidate",
  );

  // Set the globalCacheVersion cookie
  context.res.setHeader(
    "Set-Cookie",
    `globalCacheVersion=${newGlobalCacheVersion}; Path=/`,
  );

  return {
    props: {
      initialReduxState,
      globalCacheVersion: newGlobalCacheVersion,
    },
  };
}
