import "../src/utils/polyfills";
import { Provider } from "react-redux";
import "../styles/globals.scss";
import { Layout } from "../src/components/Layout/Layout";
import { MediaQueryHandler } from "../src/components/MediaQueryHandler/MediaQueryHandler";
import { getOrInitializeStore } from "../src/store";
import { checkAndResetCache } from "../src/utils/cache.utils";
import { useAppInitialization } from "../src/hooks/useAppInitialization";
import { useRouteEvents } from "../src/hooks/useRouteEvents";

function MyApp({ Component, pageProps }) {
  console.log("App.js rendered. pageProps", pageProps);
  const store = getOrInitializeStore(
    pageProps.initialReduxState,
    pageProps.globalCacheVersion,
  );

  useAppInitialization(store, pageProps.globalCacheVersion);
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
