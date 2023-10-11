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
  /**
   * @type {number}
   * @description Represents the last time the server made a successful fetch.
   * This timestamp is used to validate the client's globalCacheVersion cookie.
   * If the client's version is older than this, it indicates that the client's
   * data might be outdated, prompting a new fetch.
   */
  const lastServerFetchTimestamp = parseInt(
    context.req.cookies.lastServerFetchTimestamp || "0",
  );

  console.log("lastServerFetchTimestamp", lastServerFetchTimestamp);
  console.log("clientGlobalCacheVersion", clientGlobalCacheVersion);

  let shouldFetchData = false;
  if (!lastServerFetchTimestamp) {
    console.log("Data not fetched on server, fetching new data");
    shouldFetchData = true;
  } else if (clientGlobalCacheVersion < lastServerFetchTimestamp) {
    console.log("Client cache version is invalid, fetching new data");
    shouldFetchData = true;
  } else if (clientGlobalCacheVersion > lastServerFetchTimestamp) {
    console.log("Client has newer cache version");
    // we'd only assume it was preloaded if we were sent the usePreloadedcookie as well
    shouldFetchData = true;
  } else {
    console.log("Client and server cache version match, using cached data");
  }

  let initialReduxState;
  let globalCacheVersion = lastServerFetchTimestamp.toString();

  if (shouldFetchData) {
    try {
      const coinListData = await fetchDataForCoinListCacheInitialization(
        currentCurrency,
      );

      initialReduxState = {
        coins: {
          ...coinListData.coins,
        },
        currency: {
          ...coinListData.currency,
        },
      };

      const currentTimestamp = Date.now();
      globalCacheVersion = currentTimestamp.toString();

      // Update the cookie with the latest fetch time and set it to "never" expire (10 years)
      context.res.setHeader("Set-Cookie", [
        `lastServerFetchTimestamp=${currentTimestamp}; Path=/; HttpOnly Max-Age=${TEN_YEARS_IN_SECONDS}`,
      ]);
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
      globalCacheVersion = lastServerFetchTimestamp;
    }
  }

  return {
    props: {
      initialReduxState,
      globalCacheVersion,
    },
  };
}
