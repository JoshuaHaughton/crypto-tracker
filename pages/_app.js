import { Provider } from "react-redux";
import { Layout } from "../src/components/Layout/Layout";
import { getOrInitializeStore } from "../src/store";
import "../styles/globals.scss";
import nProgress from "nprogress";
import { Router } from "next/router";
import {
  initializeCurrencyTransformerWorker,
  terminateCurrencyTransformerWorker,
} from "../src/utils/currencyTransformerService";
import { MediaQueryHandler } from "../src/components/MediaQueryHandler/MediaQueryHandler";
import { useEffect } from "react";

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

  useEffect(() => {
    console.log("ye");
    // Initialize the transformer when the app loads
    initializeCurrencyTransformerWorker(store.dispatch);

    return () => {
      terminateCurrencyTransformerWorker();
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
