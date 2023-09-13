import { useEffect, useRef } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useDispatch, useSelector } from "react-redux";
import { CoinListCacheManager } from "../src/utils/CoinListCacheManager";

export default function Home({ coins, initialRates }) {
  const isFirstRender = useRef(true);
  const coinListCacheManager = useRef(null);

  const dispatch = useDispatch();

  const coinListCoinsByCurrency = useSelector(
    (state) => state.coins.coinListCoinsByCurrency,
  );
  const initialCurrency = useSelector(
    (state) => state.currency.initialCurrency,
  );
  const currentCurrency = useSelector((state) => state.currency.currency);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const coinListPageNumber = useSelector(
    (state) => state.appInfo.coinListPageNumber,
  );

  useEffect(() => {
    let current = coinListCacheManager.current;
    if (typeof window !== "undefined") {
      // Ensure this runs only in the browser
      coinListCacheManager.current = new CoinListCacheManager(
        dispatch,
        initialCurrency,
        initialRates,
        coins,
        currentSymbol,
        currentCurrency,
        coinListCoinsByCurrency,
      );
      current = coinListCacheManager.current;
      current.init();
    }

    return () => {
      if (current) {
        current.cleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (!isFirstRender.current && coinListCacheManager.current) {
      coinListCacheManager.current.setNewCurrency();
    }
  }, [currentCurrency]);

  useEffect(() => {
    if (coinListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, [coinListPageNumber]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <div className={styles.container}>
      <Banner />
      <h2>Crypto Prices</h2>
      <CoinList initialHundredCoins={coins.initialHundredCoins} />
      <Pagination />
    </div>
  );
}

export async function getStaticProps() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
    const fetchOptions = {
      headers: {
        Authorization: `Apikey ${apiKey}`,
      },
    };

    // Fetching all available initialRates from CryptoCompare's price multi-full endpoint for CAD
    const exchangeRateResponse = await fetch(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=CAD&tsyms=USD,AUD,GBP`,
      fetchOptions,
    );
    const exchangeData = await exchangeRateResponse.json();

    const initialRates = {
      CAD: {
        CAD: 1,
        USD: exchangeData.RAW.CAD.USD.PRICE,
        AUD: exchangeData.RAW.CAD.AUD.PRICE,
        GBP: exchangeData.RAW.CAD.GBP.PRICE,
      },
      USD: {
        CAD: 1 / exchangeData.RAW.CAD.USD.PRICE,
        USD: 1,
        AUD: exchangeData.RAW.CAD.AUD.PRICE / exchangeData.RAW.CAD.USD.PRICE,
        GBP: exchangeData.RAW.CAD.GBP.PRICE / exchangeData.RAW.CAD.USD.PRICE,
      },
      AUD: {
        CAD: 1 / exchangeData.RAW.CAD.AUD.PRICE,
        USD: exchangeData.RAW.CAD.USD.PRICE / exchangeData.RAW.CAD.AUD.PRICE,
        AUD: 1,
        GBP: exchangeData.RAW.CAD.GBP.PRICE / exchangeData.RAW.CAD.AUD.PRICE,
      },
      GBP: {
        CAD: 1 / exchangeData.RAW.CAD.GBP.PRICE,
        USD: exchangeData.RAW.CAD.USD.PRICE / exchangeData.RAW.CAD.GBP.PRICE,
        AUD: exchangeData.RAW.CAD.AUD.PRICE / exchangeData.RAW.CAD.GBP.PRICE,
        GBP: 1,
      },
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

    return {
      props: {
        coins: {
          initialHundredCoins,
          trendingCoins,
        },
        initialRates,
      },
      revalidate: 300, // regenerate the page every 5 minutes
    };
  } catch (err) {
    console.log(err);

    // Return default or placeholder data to prevent breaking the site
    return {
      props: {
        coins: {
          initialHundredCoins: [],
          trendingCoins: [],
        },
        initialRates: {},
      },
      revalidate: 300, // regenerate the page every 5 minutes
    };
  }
}
