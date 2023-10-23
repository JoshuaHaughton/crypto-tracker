import "../styles/globals.scss";
import "../src/utils/polyfills";
import { Provider } from "react-redux";
import { Layout } from "../src/components/Layout/Layout";
import { MediaQueryHandler } from "../src/components/MediaQueryHandler/MediaQueryHandler";
import { getOrInitializeStore } from "../src/store";
import { useAppInitialization } from "../src/hooks/appLifecycle/useAppInitialization";

function MyApp({ Component, pageProps }) {
  console.log("App.js rendered. pageProps", pageProps);
  const store = getOrInitializeStore(
    pageProps.initialReduxState,
    pageProps.globalCacheVersion,
  );

  useAppInitialization(store, pageProps.globalCacheVersion);

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
