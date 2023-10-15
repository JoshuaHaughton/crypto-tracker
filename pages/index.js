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
  // Retrieve cookies
  const currentCurrency =
    context.req.cookies.currentCurrency || initialCurrencyState.currentCurrency;
  const clientGlobalCacheVersion = parseInt(
    context.req.cookies.globalCacheVersion || "0",
  );
  const usePreloadedData = context.req.cookies.usePreloadedData === "true";

  // Retrieve the X-Current-Currency header value. The Service Worker sets this header when the user updates their currency preference. If the page is cached by Vercel, this header helps in busting the cache and ensuring data relevant to the user's current currency is served.
  const incomingCurrency =
    context.req.headers["x-current-currency"] || currentCurrency;
  console.log("x-current-currency", incomingCurrency);
  console.log("currentCurrency cookie", currentCurrency);

  // Calculate the time difference between now and the last globalCacheVersion
  let currentTimestamp = Date.now();
  const timeSinceLastFetch = currentTimestamp - clientGlobalCacheVersion;

  /* Check conditions to determine whether to fetch fresh data or use cached data.
  
  1. If more than five minutes have passed since the last fetch, fetch fresh data. This ensures that the user receives up-to-date cryptocurrency data.
  2. If usePreloadedData is false, this indicates that the client doesn't have recent data preloaded, or the data might be outdated; hence, fetch fresh data.
  3. On Vercel's production environment, the `Vary` header with `X-Current-Currency` ensures that separate cache versions are maintained for different currency preferences. When a user changes their currency, the cache is busted, and `getServerSideProps` runs again, fetching fresh data for the new currency (Or using the cache if available).

  Note: In a local development environment, Vercel's edge caching is not present, so every request will run `getServerSideProps` afresh. Nonetheless, the logic above is still relevant as it ensures that even locally, data remains consistent and is refreshed based on the time since the last fetch and the currency preference.
  */
  let shouldFetchData =
    timeSinceLastFetch >= FIVE_MINUTES_IN_MS || !usePreloadedData;

  let initialReduxState;
  let globalCacheVersion = clientGlobalCacheVersion.toString();

  if (shouldFetchData) {
    console.log("Fetching new CoinLists data on the server");

    try {
      const coinListData = await fetchDataForCoinListCacheInitialization(
        incomingCurrency,
      );
      // Update the globalCacheVersion after the fetch has completed
      globalCacheVersion = Date.now().toString();

      initialReduxState = {
        coins: { ...coinListData.coins },
        currency: { ...coinListData.currency },
      };

      // Set Cache-Control header to cache the page at the edge (CDN) for 5 minutes.
      // The stale-while-revalidate directive means that stale data can be used while the cache is being revalidated in the background.
      context.res.setHeader(
        "Cache-Control",
        `s-maxage=${FIVE_MINUTES_IN_SECONDS}, stale-while-revalidate`,
      );
    } catch (err) {
      console.log("Error fetching data:", err);

      // Return default data to prevent breaking the site
      initialReduxState = {
        coins: initialCoinsState,
        currency: {
          currentCurrency,
          symbol: SYMBOLS_BY_CURRENCIES[currentCurrency],
        },
      };
      globalCacheVersion = clientGlobalCacheVersion.toString();
    }
  } else {
    console.log(
      "Client has a recent globalCacheVersion and data was preloaded. Assuming data is up-to-date.",
    );
  }

  // Clear the usePreloadedData cookie for the next navigation
  context.res.setHeader("Set-Cookie", "usePreloadedData=; Max-Age=-1; Path=/;");

  // Set Vary header on X-Current-Currency & X-Global-Cache-Version. This ensures that if a user changes their currency preference, or fetches new data clientside, the cache at the CDN will consider the header and serve the appropriate version of the page or fetch a new one if it doesn't exist.
  context.res.setHeader("Vary", "X-Current-Currency, X-Global-Cache-Version");

  return {
    props: {
      initialReduxState,
      globalCacheVersion,
    },
  };
}
