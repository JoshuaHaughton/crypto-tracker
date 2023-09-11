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

export default function Home({
  coins,
  initialRates,
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
    if (!isHydrated.current) {
      return;
    }

    if (
      Object.values(coinListCoinsByCurrency).some(
        (dataArr) => dataArr.length === 0,
      )
    ) {
      const worker = new Worker("/webWorkers/currencyTransformerWorker.js");

      worker.addEventListener("message", function (e) {
        // Dispatch action to update Redux state
        dispatch(
          coinsActions.setCoinsForCurrency({
            currency: e.data.currency,
            coinData: e.data.transformedData,
          }),
        );
        console.log("home worker ran");
      });

      if (isHydrated.current) {
        ["CAD", "USD", "AUD", "GBP"].forEach((currency) => {
          worker.postMessage({
            coins: coins.initialHundredCoins,
            rates: initialRates,
            currency,
          });
        });
      }

      // Clean up the worker when the component is unmounted
      return () => {
        console.log("unmount home worker");
        worker.terminate();
      };
    }
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }

    if (firstRender.current) {
      if (displayedCoinListCoins.length === 0) {
        console.log("empty dispatch");
        dispatch(
          coinsActions.updateCoins({
            displayedCoinListCoins: coins.initialHundredCoins,
            trendingCarouselCoins: coins.trendingCoins,
            symbol: currentSymbol,
          }),
        );
      }
      if (Object.values(currencyRates).length === 0) {
        dispatch(currencyActions.updateRates({ currencyRates: initialRates }));
      }
      firstRender.current = false;
    } else {
      const setNewCurrency = () => {
        console.log("setNewCurrency", currentCurrency);

        let updatedCurrencyCoins;

        if (
          coinListCoinsByCurrency[currentCurrency] &&
          coinListCoinsByCurrency[currentCurrency].length > 0
        ) {
          console.log("currency cache used");
          updatedCurrencyCoins = coinListCoinsByCurrency[currentCurrency];
        } else {
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

          // Save the newly computed data to the cache
          dispatch(
            coinsActions.setCoinsForCurrency({
              currency: currentCurrency,
              coinData: updatedCurrencyCoins,
            }),
          );
        }

        const trendingCoins = updatedCurrencyCoins.slice(0, 10);

        dispatch(
          coinsActions.updateCoins({
            displayedCoinListCoins: updatedCurrencyCoins,
            trendingCarouselCoins: trendingCoins,
            symbol: currentSymbol,
          }),
        );
      };

      setNewCurrency();
    }
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
      },
    };
  } catch (err) {
    console.log(err);
  }
}
