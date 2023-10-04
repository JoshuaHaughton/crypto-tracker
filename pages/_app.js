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
} from "../src/utils/cache.utils";
import { initializeCoinListCache } from "../src/thunks/coinListCacheThunk";
import { COINLISTS_TABLENAME } from "../src/global/constants";

nProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: true,
});

function MyApp({ Component, pageProps }) {
  console.log("App.js rendered. pageProps", pageProps);
  const store = getOrInitializeStore(pageProps.initialReduxState);

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
      const cacheIsValid = isCacheValid(COINLISTS_TABLENAME);
      console.log("Is cache valid for preloading?", cacheIsValid);

      fetchUpdateAndReinitalizeCoinListCache(store, cacheIsValid);
    } else {
      console.log(
        "We start with CoinLists data. Don't preload it, just initalize the cache with this.",
        initialHundredCoins,
      );

      store.dispatch(initializeCoinListCache());
    }

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
