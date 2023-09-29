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
import { checkAndResetCache } from "../src/utils/cache.utils";

nProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: true,
});

function MyApp({ Component, pageProps }) {
  const store = getOrInitializeStore(pageProps.initialReduxState);

  useEffect(() => {
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

    // Run cache check on initial load
    checkAndResetCache(store, pageProps.globalCacheVersion);

    // Clean up event listeners on unmount
    return () => {
      terminateCurrencyTransformerWorker();

      Router.events.off("routeChangeStart", nProgress.start);
      Router.events.off("routeChangeError", nProgress.done);
      Router.events.off("routeChangeComplete", nProgress.done);
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
