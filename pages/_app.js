import App from "next/app";
import { Provider, useDispatch } from "react-redux";
import { Layout } from "../src/components/Layout/Layout";
import store from "../src/store";
import { coinsActions } from "../src/store/coins";
import "../styles/globals.css";
import dynamic from 'next/dynamic';
import nProgress from "nprogress";
import { Router } from "next/router";
// const ProgressBar = dynamic(() => import('../src/components/UI/ProgressBar'), { ssr: false });
Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);


function MyApp({ Component, pageProps, appProps}) {
  console.log('supposedly app' , appProps)
  

  return (
    <Provider store={store}>
      <Layout coins={appProps}>
        {/* <ProgressBar /> */}
        <Component {...pageProps} />
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
    const appProps = await App.getInitialProps(appContext);
    console.log('uh props?', appProps)

    //will check account default currency etc. after authentication setup
    try {
      const urls = [
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
      ];
    
      const initialData = await Promise.all(urls.map((u) => fetch(u)))
      .then((responses) => Promise.all(responses.map((res) => res.json())))
      
      
      const initialHundredCoins = initialData[0]
      const trendingCoins = initialData[1]
    
      return {
        appProps: {
          initialHundredCoins,
          trendingCoins,
        },
      };
    
  } catch(err) {
    console.log(err);
  }
  
    // return { ...appProps }
  }