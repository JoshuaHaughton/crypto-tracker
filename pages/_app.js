import { Provider } from "react-redux";
import { Layout } from "../src/components/Layout/Layout";
import store from "../src/store";
import "../styles/globals.css";
import nProgress from "nprogress";
import { Router } from "next/router";
import { useMediaQuery } from "../src/components/Coin/Coin";
import { useState } from "react";

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
  const isBreakpoint680 = useMediaQuery(680);
  const isBreakpoint380 = useMediaQuery(380);
  const isBreakpoint1040 = useMediaQuery(1040);
  const isBreakpoint1250 = useMediaQuery(1250);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Provider store={store}>
      <Layout>
        <Component
          {...pageProps}
          isBreakpoint380={isBreakpoint380}
          isBreakpoint680={isBreakpoint680}
          isBreakpoint1250={isBreakpoint1250}
          isBreakpoint1040={isBreakpoint1040}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </Layout>
    </Provider>
  );
}

export default MyApp;
