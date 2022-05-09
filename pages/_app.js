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

// const ProgressBar = dynamic(() => import('../src/components/UI/ProgressBar'), { ssr: false });
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

function MyApp({ Component, pageProps, appProps }) {
  console.log("supposedly app", appProps);
  const isBreakpoint680 = useMediaQuery(680);
  const isBreakpoint380 = useMediaQuery(380);
  const isBreakpoint1040 = useMediaQuery(1040);
  const isBreakpoint1250 = useMediaQuery(1250);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Provider store={store}>
      <Layout coins={appProps}>
        {/* <ProgressBar /> */}
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

// export const getServerSideProps = async () => {

//   try {
//       const urls = [
//         `https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
//         `https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
//       ];

//       const initialData = await Promise.all(urls.map((u) => fetch(u)))
//       .then((responses) => Promise.all(responses.map((res) => res.json())))

//       const initialHundredCoins = initialData[0]
//       const trendingCoins = initialData[1]

//       return {
//         props: {
//           initialHundredCoins,
//           trendingCoins,
//         },
//       };

//   } catch(err) {
//     console.log(err);
//   }

// };

MyApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  // const appProps = await App.getInitialProps(appContext);
  // console.log("uh props?", appProps);

  //will check account default currency etc. after authentication setup
  try {
    const urls = [
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
    ];

    const initialData = await Promise.all(urls.map((u) => fetch(u))).then(
      (responses) => Promise.all(responses.map((res) => res.json())),
    );

    const initialHundredCoins = initialData[0];
    const trendingCoins = initialData[1];

    return {
      appProps: {
        initialHundredCoins,
        trendingCoins,
      },
    };
  } catch (err) {
    console.log(err);
  }

  // return { ...appProps }
};
