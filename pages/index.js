import { useEffect, useRef, useState } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../src/store/coins";
import { convertCurrency } from "./coin/[id]";
import { currencyActions } from "../src/store/currency";
import db from "../src/utils/database";
import { FIVE_MINUTES_IN_DAYS } from "../src/global/constants";
import Cookies from "js-cookie";

export default function Home({
  coins,
  initialRates,
  useCachedData,
  isBreakpoint380,
  isBreakpoint680,
  isBreakpoint1250,
}) {
  const firstRender = useRef(true);
  const isHydrated = useRef(false);
  const dispatch = useDispatch();
  const coinListCoinsByCurrency = useSelector(
    (state) => state.coins.coinListCoinsByCurrency,
  );
  const displayedCoinListCoins = useSelector(
    (state) => state.coins.displayedCoinListCoins,
  );
  const initialCurrency = useSelector(
    (state) => state.currency.initialCurrency,
  );
  const currencyRates = useSelector((state) => state.currency.currencyRates);
  const currentCurrency = useSelector((state) => state.currency.currency);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const coinListPageNumber = useSelector(
    (state) => state.appInfo.coinListPageNumber,
  );

  useEffect(() => {
    // Check for hydration completion
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }

    // Dispatch initial data for the current currency
    dispatch(
      coinsActions.setCoinListForCurrency({
        currency: currentCurrency.toUpperCase(),
        coinData: coins.initialHundredCoins,
      }),
    );

    dispatch(
      coinsActions.updateCoins({
        displayedCoinListCoins: coins.initialHundredCoins,
        trendingCarouselCoins: coins.trendingCoins,
        symbol: currentSymbol,
      }),
    );

    const currencyTransformerWorker = new Worker(
      "/webWorkers/currencyTransformerWorker.js",
    );

    const handleWorkerMessage = (e) => {
      const { transformedCoins } = e.data;

      // Dispatch transformed data for transformed currencies
      Object.keys(transformedCoins).forEach((currency) => {
        dispatch(
          coinsActions.setCoinListForCurrency({
            currency,
            coinData: transformedCoins[currency],
          }),
        );

        // Update IndexedDB
        db.coinLists
          .put({
            currency: currency,
            coins: transformedCoins[currency],
          })
          .catch((err) =>
            console.log("Error setting CoinListData to IndexedDB", err),
          );
      });

      // Update IndexedDB with the initial data
      db.coinLists
        .put({
          currency: initialCurrency.toUpperCase(),
          coins: coins.initialHundredCoins,
        })
        .then(() => {
          // Set a cookie for 5 minutes indicating data is fresh
          Cookies.set("coinListDataUpdated", "true", {
            expires: FIVE_MINUTES_IN_DAYS,
          });
        })
        .catch((err) =>
          console.log("Error setting CoinListData to IndexedDB", err),
        );

      console.log("home worker ran");
    };

    currencyTransformerWorker.addEventListener("message", handleWorkerMessage);

    currencyTransformerWorker.postMessage({
      type: "transformCoinList",
      data: {
        coins: coins.initialHundredCoins,
        rates: initialRates,
        currentCurrency: initialCurrency.toUpperCase(),
      },
    });

    // Initial load logic
    if (firstRender.current) {
      console.log("empty dispatch");
      dispatch(
        coinsActions.updateCoins({
          displayedCoinListCoins: coins.initialHundredCoins,
          trendingCarouselCoins: coins.trendingCoins,
          symbol: currentSymbol,
        }),
      );

      // Update IndexedDB with the fresh data for initial currency
      db.coinLists.put({
        currency: initialCurrency.toUpperCase(),
        coins: coins.initialHundredCoins,
      });

      dispatch(currencyActions.updateRates({ currencyRates: initialRates }));

      firstRender.current = false;
    }

    // Clean up the worker when the component is unmounted
    return () => {
      console.log("unmount home worker");
      currencyTransformerWorker.removeEventListener(
        "message",
        handleWorkerMessage,
      );
      currencyTransformerWorker.terminate();
    };
  }, [isHydrated.current]);

  useEffect(() => {
    if (!isHydrated.current) {
      return;
    }

    const setNewCurrency = () => {
      console.log("setNewCurrency", currentCurrency);

      let updatedCurrencyCoins;

      if (
        coinListCoinsByCurrency[currentCurrency] &&
        coinListCoinsByCurrency[currentCurrency].length > 0
      ) {
        console.log("CURRENCY CACHE USED");
        updatedCurrencyCoins = coinListCoinsByCurrency[currentCurrency];
      } else if (coins.initialHundredCoins?.length > 0) {
        // On-the-fly transformation
        updatedCurrencyCoins = coins.initialHundredCoins
          .map((coin, i) => {
            return {
              ...coin,
              current_price: convertCurrency(
                coin.current_price,
                initialCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                initialRates,
              ),
              market_cap: convertCurrency(
                coin.market_cap,
                initialCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                initialRates,
              ),
              market_cap_rank: i + 1,
              total_volume: convertCurrency(
                coin.total_volume,
                initialCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                initialRates,
              ),
              high_24h: convertCurrency(
                coin.high_24h,
                initialCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                initialRates,
              ),
              low_24h: convertCurrency(
                coin.low_24h,
                initialCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                initialRates,
              ),
              price_change_24h: convertCurrency(
                coin.price_change_24h,
                initialCurrency.toUpperCase(),
                currentCurrency.toUpperCase(),
                initialRates,
              ),
            };
          })
          .filter(Boolean);

        const trendingCoins = updatedCurrencyCoins.slice(0, 10);

        dispatch(
          coinsActions.updateCoins({
            displayedCoinListCoins: updatedCurrencyCoins,
            trendingCarouselCoins: trendingCoins,
            symbol: currentSymbol,
          }),
        );

        // Save the newly computed data to the cache
        dispatch(
          coinsActions.setCoinListForCurrency({
            currency: currentCurrency,
            coinData: updatedCurrencyCoins,
          }),
        );
      }

      // Update IndexedDB with the transformed data for current currency
      db.coinLists.put({
        currency: currentCurrency.toUpperCase(),
        coins: updatedCurrencyCoins,
      });
    };

    setNewCurrency();
  }, [currentCurrency]);

  useEffect(() => {
    if (coinListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, []);

  return (
    <div className={styles.container}>
      <Banner />
      <h2>Crypto Prices</h2>
      <CoinList
        initialHundredCoins={coins.initialHundredCoins}
        isBreakpoint380={isBreakpoint380}
        isBreakpoint680={isBreakpoint680}
        isBreakpoint1250={isBreakpoint1250}
      />
      <Pagination />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { cookie } = context.req.headers;
  console.log("COOKIE CHECK!!!", cookie);
  const isDataFresh = cookie.coinListDataUpdated;

  // If data is fresh, skip fetching new data & use cached data via indexedDB.
  if (isDataFresh != null) {
    return {
      props: {
        useCachedData: true,
        // Just placeholders, actual data will be fetched from IndexedDB
        coins: null,
        initialRates: null,
      },
    };
  }

  const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
  const fetchOptions = {
    headers: {
      Authorization: `Apikey ${apiKey}`,
    },
  };

  try {
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
    console.log(initialHundredCoins[0]);

    return {
      props: {
        coins: {
          initialHundredCoins,
          trendingCoins,
        },
        initialRates,
        useCachedData: false,
      },
    };
  } catch (err) {
    console.log(err);
  }
}
