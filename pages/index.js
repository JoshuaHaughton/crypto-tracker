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
import {
  FIVE_MINUTES_IN_MS,
  FIVE_MINUTES_IN_SECONDS,
  TEN_YEARS_IN_SECONDS,
} from "../src/global/constants";

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
  // Retrieve the currency and globalCacheVersion from the request cookies
  const currentCurrency =
    context.req.cookies.currentCurrency || initialCurrencyState.currentCurrency;
  const clientGlobalCacheVersion = parseInt(
    context.req.cookies.globalCacheVersion || "0",
  );
  const usePreloadedData = context.req.cookies.usePreloadedData === "true";
  let currentTimestamp = Date.now();

  // Calculate the time difference between now and the last globalCacheVersion
  const timeSinceLastFetch = currentTimestamp - clientGlobalCacheVersion;

  let shouldFetchData = timeSinceLastFetch >= FIVE_MINUTES_IN_MS;

  if (usePreloadedData && !shouldFetchData) {
    console.log(
      "Client has a recent globalCacheVersion and data was preloaded. Assuming data is up-to-date.",
    );
    shouldFetchData = false;
  } else {
    console.log("Fetching new CoinLists data on the server");
  }

  let initialReduxState;
  let globalCacheVersion = clientGlobalCacheVersion.toString();

  if (shouldFetchData) {
    try {
      const coinListData = await fetchDataForCoinListCacheInitialization(
        currentCurrency,
      );
      // Update the timestamp after the fetch has completed
      currentTimestamp = Date.now();

      initialReduxState = {
        coins: {
          ...coinListData.coins,
        },
        currency: {
          ...coinListData.currency,
        },
      };

      globalCacheVersion = currentTimestamp.toString();

      // Update the cookie with the latest globalCacheVersion and set it to expire in 5 mins
      context.res.setHeader("Set-Cookie", [
        `globalCacheVersion=${globalCacheVersion}; Path=/; HttpOnly Max-Age=${FIVE_MINUTES_IN_SECONDS}`,
      ]);
      // Set Cache-Control header for 5 minutes
      context.res.setHeader(
        "Cache-Control",
        `s-maxage=${FIVE_MINUTES_IN_SECONDS}, stale-while-revalidate`,
      );
    } catch (err) {
      console.log(err);
      // Return default or placeholder data to prevent breaking the site
      initialReduxState = {
        coins: initialCoinsState,
        currency: {
          currentCurrency,
          symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
        },
      };
      globalCacheVersion = clientGlobalCacheVersion.toString();
    }
  }

  // Before returning, make sure to delete the "usePreloadedData" cookie to reset it for the next navigation
  context.res.setHeader("Set-Cookie", "usePreloadedData=; Max-Age=-1; Path=/;");

  return {
    props: {
      initialReduxState,
      globalCacheVersion,
    },
  };
}
