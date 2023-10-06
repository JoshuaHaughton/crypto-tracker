import { Provider } from "react-redux";
import { Layout } from "../src/components/Layout/Layout";
import { MediaQueryHandler } from "../src/components/MediaQueryHandler/MediaQueryHandler";
import { getOrInitializeStore } from "../src/store";
import "../styles/globals.scss";
import nProgress from "nprogress";
import { checkAndResetCache } from "../src/utils/cache.utils";
import { useDataInitialization } from "../src/hooks/useDataInitialization";
import { useRouteEvents } from "../src/hooks/useRouteEvents";
import { useWebWorker } from "../src/hooks/useWebWorker";

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

  useWebWorker(store.dispatch);
  useDataInitialization(store, pageProps.globalCacheVersion);
  useRouteEvents(() => checkAndResetCache(store, pageProps.globalCacheVersion));

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
