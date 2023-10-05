import { useEffect } from "react";
import { Provider } from "react-redux";
import { Layout } from "../src/components/Layout/Layout";
import { MediaQueryHandler } from "../src/components/MediaQueryHandler/MediaQueryHandler";
import { getOrInitializeStore } from "../src/store";
import "../styles/globals.scss";
import nProgress from "nprogress";
import { Router } from "next/router";
import {
  initializeCurrencyTransformerWorker,
  terminateCurrencyTransformerWorker,
} from "../src/utils/currencyTransformerService";
import {
  checkAndResetCache,
  fetchUpdateAndReinitalizeCoinListCache,
  isCacheValid,
  storeCurrencyRatesInIndexedDB,
} from "../src/utils/cache.utils";
import { initializeCoinListCache } from "../src/thunks/coinListCacheThunk";
import {
  COINLISTS_TABLENAME,
  CURRENCYRATES_TABLENAME,
  CURRENT_CURRENCY_COOKIE_EXPIRY_TIME,
  GLOBALCACHEVERSION_COOKIE_EXPIRY_TIME,
} from "../src/global/constants";
import Cookie from "js-cookie";

nProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: true,
});

function MyApp({ Component, pageProps }) {
  console.log("App.js rendered. pageProps", pageProps);
  const store = getOrInitializeStore(
    pageProps.initialReduxState,
    pageProps.globalCacheVersion,
  );

  useEffect(() => {
    console.log("App.js useEffect ran");
    // Initialize services
    initializeCurrencyTransformerWorker(store.dispatch);

    // Event listener to handle route changes
    const handleRouteChange = () => {
      checkAndResetCache(store, pageProps.globalCacheVersion);
    };

    // Set up event listeners
    Router.events.on("routeChangeStart", nProgress.start);
    Router.events.on("routeChangeError", nProgress.done);
    Router.events.on("routeChangeComplete", nProgress.done);
    Router.events.on("routeChangeComplete", handleRouteChange);

    const initialHundredCoins = store.getState().coins.displayedCoinListCoins;

    // If we don't start off with the CoinLists (any page other than the CoinLists page) Preload the CoinLists data
    if (
      !Array.isArray(initialHundredCoins) ||
      initialHundredCoins.length === 0
    ) {
      console.log(
        "We didnt start with CoinLists data so we need to preload it.",
      );
      const cacheIsValid =
        isCacheValid(COINLISTS_TABLENAME) &&
        isCacheValid(CURRENCYRATES_TABLENAME);
      console.log("Is cache valid for preloading?", cacheIsValid);

      fetchUpdateAndReinitalizeCoinListCache(store, cacheIsValid);
    } else {
      console.log(
        "We start with CoinLists data. DON'T PRELOAD IT, just initalize the cache with this.",
      );

      store.dispatch(initializeCoinListCache());

      const clientGlobalCacheVersion = Cookie.get("globalCacheVersion");
      if (
        pageProps.globalCacheVersion != null &&
        pageProps.globalCacheVersion !== clientGlobalCacheVersion
      ) {
        Cookie.set("globalCacheVersion", pageProps.globalCacheVersion, {
          expires: GLOBALCACHEVERSION_COOKIE_EXPIRY_TIME,
        });

        storeCurrencyRatesInIndexedDB(store.getState().currency.currencyRates);
      }
    }

    // Update Cookie for current currency
    Cookie.set("currentCurrency", store.getState().currency.currentCurrency, {
      expires: CURRENT_CURRENCY_COOKIE_EXPIRY_TIME,
    });

    // Clean up event listeners on unmount
    return () => {
      terminateCurrencyTransformerWorker();

      Router.events.off("routeChangeStart", nProgress.start);
      Router.events.off("routeChangeError", nProgress.done);
      Router.events.off("routeChangeComplete", nProgress.done);
      Router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [store, pageProps.globalCacheVersion]);

  return (
    <Provider store={store}>
      <MediaQueryHandler>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MediaQueryHandler>
    </Provider>
  );
}

export default MyApp;
