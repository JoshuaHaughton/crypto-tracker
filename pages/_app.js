import "./main.scss";
import "../src/utils/polyfills";
import { Provider } from "react-redux";
import { useRouter } from "next/router";
import { Layout } from "../src/components/Layout/Layout";
import SpaLayout from "../src/components/SPA/SpaLayout/SpaLayout";
import { MediaQueryHandler } from "../src/components/MediaQueryHandler/MediaQueryHandler";
import { getOrInitializeStore } from "../src/store";
import { useAppInitialization } from "../src/hooks/appLifecycle/useAppInitialization";

function MyApp({ Component, pageProps }) {
  if (typeof window !== "undefined") {
    console.log("App.js rendered. pageProps", pageProps);
  }

  const router = useRouter();
  const store = getOrInitializeStore(
    pageProps.initialReduxState,
    pageProps.globalCacheVersion,
  );

  useAppInitialization(
    store,
    pageProps.initialReduxState,
    pageProps.globalCacheVersion,
  );

  const isSpaRoute = router.pathname.startsWith("/app");

  const content = isSpaRoute ? (
    <SpaLayout>
      <Component {...pageProps} />
    </SpaLayout>
  ) : (
    <Component {...pageProps} />
  );

  return (
    <Provider store={store}>
      <MediaQueryHandler>
        <Layout>{content}</Layout>
        {/* Modal divs */}
        <div id="backdrop-root"></div>
        <div id="overlay-root"></div>
      </MediaQueryHandler>
    </Provider>
  );
}

export default MyApp;
