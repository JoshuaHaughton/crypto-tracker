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

function MyApp({ Component, pageProps, appProps }) {
  const isBreakpoint680 = useMediaQuery(680);
  const isBreakpoint380 = useMediaQuery(380);
  const isBreakpoint1040 = useMediaQuery(1040);
  const isBreakpoint1250 = useMediaQuery(1250);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Provider store={store}>
      <Layout coins={appProps}>
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

MyApp.getInitialProps = async (appContext) => {
  const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: {
      Authorization: `Apikey ${apiKey}`,
    },
  };

  try {
    // Fetching all available rates from CryptoCompare's price multi-full endpoint for CAD
    const exchangeRateResponse = await fetch(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=CAD&tsyms=USD,AUD,GBP`,
      fetchOptions,
    );
    const exchangeData = await exchangeRateResponse.json();

    const rates = {
      CAD: 1,
      USD: exchangeData.RAW.CAD.USD.PRICE,
      AUD: exchangeData.RAW.CAD.AUD.PRICE,
      GBP: exchangeData.RAW.CAD.GBP.PRICE,
    };

    // Fetching the top 100 assets by market cap from CryptoCompare in CAD
    const assetsResponse = await fetch(
      "https://min-api.cryptocompare.com/data/top/mktcapfull?limit=100&tsym=CAD",
      fetchOptions,
    );
    const assetsData = await assetsResponse.json();

    const initialHundredCoins = assetsData.Data.map((entry, i) => {
      const coin = entry.CoinInfo;
      const metrics = entry.RAW?.CAD;
      if (!metrics) {
        console.warn(`Metrics not found for coin: ${coin.Name}`);
        return null;
      }

      return {
        id: coin.Name,
        symbol: coin.Name,
        name: coin.FullName,
        image: `https://cryptocompare.com${coin.ImageUrl}`,
        current_price: metrics.PRICE,
        market_cap: metrics.MKTCAP,
        market_cap_rank: i + 1,
        total_volume: metrics.TOTALVOLUME24HTO,
        high_24h: metrics.HIGH24HOUR,
        low_24h: metrics.LOW24HOUR,
        price_change_24h: metrics.CHANGE24HOUR,
        price_change_percentage_24h: metrics.CHANGEPCT24HOUR,
        circulating_supply: metrics.SUPPLY,
      };
    }).filter(Boolean);

    const trendingCoins = initialHundredCoins.slice(0, 10);
    console.log(initialHundredCoins[0]);

    return {
      appProps: {
        initialHundredCoins,
        trendingCoins,
        rates,
      },
    };
  } catch (err) {
    console.log(err);
  }
};
