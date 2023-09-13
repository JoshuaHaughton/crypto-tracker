import { useEffect, useRef } from "react";
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

const EXPIRY_TIME_IN_MINUTES = 5;

const setWithExpiry = (key, value) => {
  const now = new Date().getTime();
  const expiry = now + EXPIRY_TIME_IN_MINUTES * 60 * 1000;
  localStorage.setItem(key, JSON.stringify({ value, expiry }));
};

const getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date().getTime();

  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};

const isCacheValid = () => {
  const currencies = ["USD", "CAD", "AUD", "GBP"];
  return currencies.every(
    (currency) => getWithExpiry(`coinList_${currency}`) === "valid",
  );
};

const clearCacheForCurrency = (currency) => {
  // Clear from IndexedDB
  db.coinLists
    .delete(currency)
    .then(() => {
      console.log(`Cache cleared from IndexedDB for ${currency}`);
    })
    .catch((err) => {
      console.error(
        `Error clearing cache from IndexedDB for ${currency}:`,
        err,
      );
    });

  // Clear from localStorage
  localStorage.removeItem(`coinList_${currency}`);
  console.log(`Cache cleared from localStorage for ${currency}`);
};

export default function Home({ coins, initialRates }) {
  const isFirstRender = useRef(true);
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

  const fetchDataFromCache = () => {
    return db.coinLists
      .each((data) => {
        if (data != null && data.coins) {
          dispatch(
            coinsActions.setCoinListForCurrency({
              currency: data.currency,
              coinData: data.coins,
            }),
          );
        }
      })
      .then(() => true)
      .catch((err) => {
        cacheUsedSuccessfully = false;
        console.error("Error fetching data from IndexedDB:", err);
      });
  };

  useEffect(() => {
    // If cache is not valid, clear the data for each currency in IndexedDB
    if (!isCacheValid()) {
      ["USD", "CAD", "AUD", "GBP"].forEach(clearCacheForCurrency);
    }

    const currencyTransformerWorker = new Worker(
      "/webWorkers/currencyTransformerWorker.js",
    );

    const handleWorkerMessage = (e) => {
      const { transformedCoins } = e.data;
      console.log("message returned from WebWorker", transformedCoins);

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
            currency,
            coins: transformedCoins[currency],
          })
          .then(() => {
            // Mark this currency as valid in localStorage with expiration
            setWithExpiry(`coinList_${currency}`, "valid");
          })
          .catch((err) => {
            console.log("Error setting CoinListData to IndexedDB", err);
          });
      });

      // Update IndexedDB with the initial data
      db.coinLists
        .put({
          currency: initialCurrency.toUpperCase(),
          coins: coins.initialHundredCoins,
        })
        .then(() => {
          // Mark this currency as valid in localStorage with expiration
          setWithExpiry(`coinList_${initialCurrency.toUpperCase()}`, "valid");
        })
        .catch((err) =>
          console.log("Error setting CoinListData to IndexedDB", err),
        );

      console.log("home worker ran");
    };

    const loadInitialCoinsAndCurrencyAlternatives = async () => {
      // Dispatch initial data for the current currency
      dispatch(
        coinsActions.updateCoins({
          displayedCoinListCoins: coins.initialHundredCoins,
          trendingCarouselCoins: coins.trendingCoins,
          symbol: currentSymbol,
        }),
      );

      dispatch(
        coinsActions.setCoinListForCurrency({
          currency: initialCurrency.toUpperCase(),
          coinData: coins.initialHundredCoins,
        }),
      );

      // If cached data is available and valid, use it.
      if (isCacheValid()) {
        const cacheUsedSuccessfully = await fetchDataFromCache();
        if (cacheUsedSuccessfully) {
          return;
        }
      }
      console.log("No cache");

      currencyTransformerWorker.addEventListener(
        "message",
        handleWorkerMessage,
      );

      console.log("message posted to WebWorker");
      currencyTransformerWorker.postMessage({
        type: "transformCoinList",
        data: {
          coins: coins.initialHundredCoins,
          rates: initialRates,
          currentCurrency: initialCurrency.toUpperCase(),
        },
      });

      // Update IndexedDB with the fresh data for initial currency
      db.coinLists
        .put({
          currency: initialCurrency.toUpperCase(),
          coins: coins.initialHundredCoins,
        })
        .then(() => {
          // Mark this currency as valid in localStorage with expiration
          setWithExpiry(`coinList_${initialCurrency.toUpperCase()}`, "valid");
        })
        .catch((err) =>
          console.log("Error setting CoinListData to IndexedDB", err),
        );

      // Update redux with currency rates for each currency
      dispatch(currencyActions.updateRates({ currencyRates: initialRates }));
    };

    loadInitialCoinsAndCurrencyAlternatives();

    // Clean up the worker when the component is unmounted
    return () => {
      if (currencyTransformerWorker) {
        console.log("unmount home worker");
        currencyTransformerWorker.removeEventListener(
          "message",
          handleWorkerMessage,
        );
        currencyTransformerWorker.terminate();
      }
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) return;

    const setNewCurrency = () => {
      console.log("setNewCurrency", currentCurrency);

      let updatedCurrencyCoins;

      if (
        coinListCoinsByCurrency[currentCurrency.toUpperCase()] &&
        coinListCoinsByCurrency[currentCurrency.toUpperCase()].length > 0
      ) {
        console.log("CACHE USED for setNewCurrency");
        updatedCurrencyCoins =
          coinListCoinsByCurrency[currentCurrency.toUpperCase()];
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
      }

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

      // Update IndexedDB with the transformed data for current currency
      db.coinLists
        .put({
          currency: currentCurrency.toUpperCase(),
          coins: updatedCurrencyCoins,
        })
        .then(() => {
          // Mark this currency as updated in localStorage with expiration
          setWithExpiry(`coinList_${currentCurrency.toUpperCase()}`, "valid");
        })
        .catch((err) =>
          console.log("Error setting CoinListData to IndexedDB", err),
        );
    };

    setNewCurrency();
  }, [currentCurrency]);

  useEffect(() => {
    if (coinListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, []);

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
