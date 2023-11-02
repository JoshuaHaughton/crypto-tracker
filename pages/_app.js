import "../styles/globals.scss";
import "../src/utils/polyfills";
import { Provider } from "react-redux";
import { Layout } from "../src/components/Layout/Layout";
import { MediaQueryHandler } from "../src/components/MediaQueryHandler/MediaQueryHandler";
import { getOrInitializeStore } from "../src/store";
import { useAppInitialization } from "../src/hooks/appLifecycle/useAppInitialization";

function MyApp({ Component, pageProps }) {
  if (typeof window !== "undefined") {
    console.log("App.js rendered. pageProps", pageProps);
  }

  const store = getOrInitializeStore(
    pageProps.initialReduxState,
    pageProps.globalCacheVersion,
  );

  useAppInitialization(
    store,
    pageProps.initialReduxState,
    pageProps.globalCacheVersion,
  );

  return (
    <Provider store={store}>
      <MediaQueryHandler>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        {/* Modal divs */}
        <div id="backdrop-root"></div>
        <div id="overlay-root"></div>
      </MediaQueryHandler>
    </Provider>
  );
}

export default MyApp;
