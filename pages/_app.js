import { useEffect } from "react";
import { Provider } from "react-redux";
import { Layout } from "../src/components/Layout/Layout";
import { MediaQueryHandler } from "../src/components/MediaQueryHandler/MediaQueryHandler";
import { getOrInitializeStore, initializeStore } from "../src/store";
import { initializeCoinListCache } from "../src/thunks/coinListCacheThunk";
import "../styles/globals.scss";
import nProgress from "nprogress";
import { Router } from "next/router";
import {
  initializeCurrencyTransformerWorker,
  terminateCurrencyTransformerWorker,
} from "../src/utils/currencyTransformerService";
import Cookie from "js-cookie";
import { clearCacheForAllKeysInTable } from "../src/utils/cache.utils";
import {
  COINDETAILS_TABLENAME,
  COINLISTS_TABLENAME,
} from "../src/global/constants";

nProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: true,
});

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

Router.events.on("routeChangeComplete", () => {
  window.scroll({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
});

function MyApp({ Component, pageProps }) {
  const store = getOrInitializeStore(pageProps.initialReduxState);

  const checkAndResetCache = (serverGlobalCacheVersion) => {
    const currentTime = Date.now();
    const fiveMinutesInMilliseconds = 5 * 60 * 1000;
    const lastVisit = localStorage.getItem("lastVisit") || currentTime;
    const lastCacheReset = localStorage.getItem("lastCacheReset") || 0;

    const currentCookieValue = Cookie.get("globalCacheVersion");

    const shouldResetCache =
      currentTime - lastVisit > fiveMinutesInMilliseconds &&
      currentTime - lastCacheReset > fiveMinutesInMilliseconds;

    if (shouldResetCache) {
      console.log("Cache Reset");

      // Clear local storage, indexedDB, & cookie coin caches
      clearCacheForAllKeysInTable(COINLISTS_TABLENAME);
      clearCacheForAllKeysInTable(COINDETAILS_TABLENAME);
      Cookies.remove("preloadedCoins");

      // Reset Redux store
      initializeStore();

      // Determine the new globalCacheVersion
      let newGlobalCacheVersion;
      if (
        serverGlobalCacheVersion &&
        currentCookieValue !== serverGlobalCacheVersion
      ) {
        newGlobalCacheVersion = serverGlobalCacheVersion;
      } else {
        newGlobalCacheVersion = currentTime.toString();
      }

      // Update the cookie, last visited timestamp, and lastCacheReset timestamp in local storage
      Cookie.set("globalCacheVersion", newGlobalCacheVersion);
      localStorage.setItem("lastVisit", currentTime);
      localStorage.setItem("lastCacheReset", currentTime); // Storing the time of the last cache reset
    }
  };

  useEffect(() => {
    initializeCurrencyTransformerWorker(store.dispatch);
    store.dispatch(initializeCoinListCache());
    const handleRouteChange = () => {
      checkAndResetCache(pageProps.globalCacheVersion);
    };

    // Listen to route changes
    Router.events.on("routeChangeComplete", handleRouteChange);

    // Also run the logic on the initial app load
    checkAndResetCache(pageProps.globalCacheVersion);
    return () => {
      terminateCurrencyTransformerWorker();
      Router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

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
