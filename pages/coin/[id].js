import React, { useEffect, useState, useRef } from "react";
import HistoryChart from "../../src/components/UI/HistoryChart";
import styles from "./Coin.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  coinsActions,
  initialCoinsState as defaultInitialCoinsState,
} from "../../src/store/coins";
import Link from "next/link";
import {
  currencyActions,
  initialCurrencyState as defaultInitialCurrencyState,
} from "../../src/store/currency";
import { convertCurrency } from "../../src/utils/currency.utils";
import db from "../../src/utils/database";
import { initializeCoinListCache } from "../../src/thunks/coinListCacheThunk";
import {
  fetchBaseDataFromCryptoCompare,
  fetchCoinDetailsFromCryptoCompare,
} from "../../src/utils/api.utils";
import { parse } from "cookie";
import {
  fetchDataFromIndexedDB,
  isCacheValid,
} from "../../src/utils/cache.utils";
import { COINLISTS_TABLENAME } from "../../src/global/constants";
import Cookie from "js-cookie";

const Coin = () => {
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const currentCurrency = useSelector(
    (state) => state.currency.currentCurrency,
  );
  // Check if data exists in the Redux store
  const coinListInStore = useSelector(
    (state) => state.coins.displayedCoinListCoins,
  );
  const coinDetails = useSelector((state) => state.coins.selectedCoinDetails);
  const coin = coinDetails.coinInfo;

  const dispatch = useDispatch();
  const [currentChartPeriod, setCurrentChartPeriod] = useState("day");
  const isHydrated = useRef(false);
  const firstRender = useRef(true);
  console.log("coinDetails", coinDetails);

  const marketChart = coinDetails.marketChartValues;
  const marketValues = coinDetails.marketValues;
  const [chartData, setChartData] = useState(coinDetails.chartValues);

  const dayClickHandler = () => {
    setChartData((prev) => {
      return {
        labels: marketChart?.day.map((data) =>
          new Date(data[0]).toLocaleTimeString(),
        ),
        datasets: [
          {
            label: `${
              coin.name
            } Price (Past day) in ${currentCurrency.toUpperCase()}`,
            data: marketValues?.dayMarketValues,
            type: "line",
            pointRadius: 1.3,
            borderColor: "#ff9500",
          },
        ],
      };
    });

    setCurrentChartPeriod("day");
  };

  const weekClickHandler = () => {
    setChartData((prev) => {
      return {
        labels: marketChart?.week.map((data) =>
          new Date(data[0]).toLocaleDateString(),
        ),
        datasets: [
          {
            label: `${
              coin.name
            } Price (Past week) in ${currentCurrency.toUpperCase()}`,
            data: marketValues?.weekMarketValues,
            type: "line",
            pointRadius: 1.3,
            borderColor: "#ff9500",
          },
        ],
      };
    });

    setCurrentChartPeriod("week");
  };

  const monthClickHandler = () => {
    setChartData((prev) => {
      return {
        labels: marketChart?.month.map((data) =>
          new Date(data[0]).toLocaleDateString(),
        ),
        datasets: [
          {
            label: `${
              coin.name
            } Price (Past month) in ${currentCurrency.toUpperCase()}`,
            data: marketValues?.monthMarketValues,
            type: "line",
            pointRadius: 1.3,
            borderColor: "#ff9500",
          },
        ],
      };
    });

    setCurrentChartPeriod("month");
  };

  const yearClickHandler = () => {
    setChartData((prev) => {
      return {
        labels: marketChart?.year.map((data) =>
          new Date(data[0]).toLocaleDateString(),
        ),
        datasets: [
          {
            label: `${
              coin.name
            } Price (Past year) in ${currentCurrency.toUpperCase()}`,
            data: marketValues?.yearMarketValues,
            type: "line",
            pointRadius: 1.3,
            borderColor: "#ff9500",
          },
        ],
      };
    });

    setCurrentChartPeriod("year");
  };

  const bigNumberFormatter = (num) => {
    if (num > 999 && num < 1000000) {
      return (num / 1000).toFixed(1) + "K"; // convert to K for numbers > 1000 < 1 million
    } else if (num > 1000000 && num < 1000000000) {
      return (num / 1000000).toFixed(1) + "M"; // convert to M for numbers > 1 million
    } else if (num > 1000000000 && num < 1000000000000) {
      return (num / 1000000000).toFixed(1) + "B"; // convert to B for numbers > 1 billion
    } else if (num > 1000000000000) {
      return (num / 1000000000000).toFixed(1) + "T"; // convert to T for numbers > 1 trillion
    } else if (num <= 999) {
      return num; // if value < 1000, nothing to do
    }
  };

  const removeHTML = (str) => str.replace(/<\/?[^>]+(>|$)/g, "");

  useEffect(() => {
    // Check for hydration completion
    if (!isHydrated.current) {
      return;
    }

    // Initialize the worker
    // const currencyTransformerWorker = new Worker(
    //   "/webWorkers/currencyTransformerWorker.js",
    // );

    // Define the message handler for the worker
    const handleWorkerMessage = (e) => {
      const { transformedData } = e.data;

      // Dispatch initial data for the current currency
      dispatch(
        coinsActions.updateSelectedCoinDetailsForCurrency({
          currency: currentCurrency.toUpperCase(),
          coinDetail: coinDetails,
        }),
      );

      // Update IndexedDB with the fresh coin details
      db.coinDetails.put({
        currency: currentCurrency.toUpperCase(),
        details: coinDetails,
      });

      // Dispatch transformed data for other currencies
      Object.keys(transformedData).forEach((currency) => {
        dispatch(
          coinsActions.updateSelectedCoinDetailsForCurrency({
            currency,
            coinDetail: transformedData[currency],
          }),
        );

        // Update IndexedDB
        db.coinDetails.put({
          currency,
          details: transformedData[currency],
        });
      });

      console.log("coin worker ran");
    };

    // Attach the event listener to the worker
    // currencyTransformerWorker.addEventListener("message", handleWorkerMessage);

    // If coin and initialRates are available, post data to the worker
    // if (coin && initialRates) {
    //   console.log("post to COIN PAGE worker");
    //   currencyTransformerWorker.postMessage({
    //     type: "transformAllCoinDetailsCurrencies",
    //     data: {
    //       coinToTransform: coin,
    //       fromCurrency: currentCurrency.toUpperCase(),
    //       currencyRates: initialRates,
    //       currenciesToExclude: [currentCurrency.toUpperCase()],
    //     },
    //   });
    // }

    // Cleanup: remove the event listener and terminate the worker when the component is unmounted
    return () => {
      console.log("unmount coin worker");
      // currencyTransformerWorker.removeEventListener(
      //   "message",
      //   handleWorkerMessage,
      // );
      // currencyTransformerWorker.terminate();
    };
  }, [isHydrated]);

  useEffect(() => {
    // should do if either the cache isnt valid or on page revalidates (new data)
    const prefetchHomePage = async () => {
      console.log("prefetchHomePage");

      let initialRates, initialHundredCoins, trendingCarouselCoins;

      // Check the cache first
      const cacheIsValid = isCacheValid(COINLISTS_TABLENAME);
      const cachedCoinList = await fetchDataFromIndexedDB(
        COINLISTS_TABLENAME,
        currentCurrency.toUpperCase(),
      );

      if (cacheIsValid && cachedCoinList) {
        // Use cached data if available
        console.log("Use cached data if available");
        initialHundredCoins = cachedCoinList.initialHundredCoins;
        trendingCarouselCoins = cachedCoinList.trendingCarouselCoins;
      } else {
        // Fetch from API if not in cache
        console.log("Fetch from API if not in cache");
        const fetchedData = await fetchBaseDataFromCryptoCompare();
        initialRates = fetchedData.initialRates;
        initialHundredCoins = fetchedData.initialHundredCoins;
        trendingCarouselCoins = fetchedData.trendingCarouselCoins;

        // Update the global coinlist cache
        dispatch(
          coinsActions.updateCoins({
            displayedCoinListCoins: initialHundredCoins,
            trendingCarouselCoins,
            symbol: currentSymbol,
          }),
        );
        dispatch(
          coinsActions.setCoinListForCurrency({
            currency: currentCurrency,
            coinData: initialHundredCoins,
          }),
        );
        dispatch(currencyActions.updateRates({ currencyRates: initialRates }));
        dispatch(initializeCoinListCache());

        // Handle global cache version update
        const currentTimestamp = Date.now().toString();
        Cookie.set("globalCacheVersion", currentTimestamp);
      }
    };

    if (coinListInStore && coinListInStore.length > 0) {
      return;
    } else {
      // If the data doesn't already exist in Redux, then fetch & preload it
      // prefetchHomePage();
    }
  }, []);

  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // handle from thunk instead

    // updateSelectedCoinCurrencyValues();
  }, [currentCurrency]);

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.coin_info}>
          <Link href="/" className={styles.back_link} passHref>
            <FontAwesomeIcon icon={faArrowLeft} className={styles.back_link} />
          </Link>
          <header className={styles.header}>
            <div className={styles.title_wrapper}>
              <Image
                src={coin.image}
                alt={coin.name}
                // layout={'fill'}
                width={88}
                height={88}
                className={styles.image}
              />
              {/* <div className={styles.text_wrapper}> */}
              <h1 className={styles.name}>{coin.name}</h1>
              <h4 className={styles.symbol}>{coin.symbol.toUpperCase()}</h4>

              {/* </div> */}
            </div>
            <div className={styles.description}>
              <p>
                {coin.description.split(".").length > 2
                  ? `${removeHTML(coin.description)
                      .split(".")
                      .slice(0, 2)
                      .join(". ")}.`
                  : `${removeHTML(coin.description).slice(0, 170)}...`}
              </p>
            </div>
          </header>

          <div className={styles.info_card}>
            <div className={styles.info_row}>
              <h3>Current Price:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {coin.current_price.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                })}
              </p>
            </div>

            <div className={styles.info_row}>
              <h3>All Time High:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {coin.all_time_high.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className={styles.info_row}>
              <h3>Market Cap:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {bigNumberFormatter(coin.market_cap)}
              </p>
            </div>

            <div className={styles.info_row}>
              <h3>24h Price Change:</h3>
              {+coin?.price_change_1d > 0 ? (
                <p className={styles.current}>
                  {+coin?.price_change_1d < 1 &&
                    `${currentSymbol}${coin?.price_change_1d}`}
                  {+coin?.price_change_1d > 1 &&
                    `${currentSymbol}${coin?.price_change_1d.toFixed(2)}`}
                </p>
              ) : (
                <p className={styles.current}>
                  {+coin?.price_change_1d < -1 &&
                    `${currentSymbol}${coin?.price_change_1d.toLocaleString()}`}
                  {+coin?.price_change_1d > -1 &&
                    `- ${currentSymbol}${Math.abs(
                      coin?.price_change_1d,
                    ).toFixed(8)}`}
                </p>
              )}
            </div>
          </div>
        </div>

        <hr />

        <div className={styles.chart_wrapper}>
          <div className={styles.chart_card}>
            <div className={styles.chart}>
              <HistoryChart
                chartData={chartData}
                currentChartPeriod={currentChartPeriod}
              />
            </div>
          </div>
          <div className={styles.chart_buttons}>
            {currentChartPeriod === "day" ? (
              <button
                className={styles.selected_button}
                onClick={dayClickHandler}
              >
                Day
              </button>
            ) : (
              <button onClick={dayClickHandler}>Day</button>
            )}

            {currentChartPeriod === "week" ? (
              <button
                className={styles.selected_button}
                onClick={weekClickHandler}
              >
                Week
              </button>
            ) : (
              <button onClick={weekClickHandler}>Week</button>
            )}

            {currentChartPeriod === "month" ? (
              <button
                className={styles.selected_button}
                onClick={monthClickHandler}
              >
                Month
              </button>
            ) : (
              <button onClick={monthClickHandler}>Month</button>
            )}

            {currentChartPeriod === "year" ? (
              <button
                className={styles.selected_button}
                onClick={yearClickHandler}
              >
                Year
              </button>
            ) : (
              <button onClick={yearClickHandler}>Year</button>
            )}
          </div>

          <div className={styles.percentage_details}>
            {/* <h3>Percentage Changes</h3> */}
            <div className={styles.cards_wrapper}>
              {currentChartPeriod === "day" ? (
                <div className={styles.selected_card}>
                  <div className={styles.card_description}>
                    <p>Day Gain/Loss</p>
                    {/* <p>Past Day %:</p> */}
                    {coin?.price_change_percentage_24h >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin?.price_change_percentage_24h.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin?.price_change_percentage_24h.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.card_description}>
                    <p>Day Gain/Loss</p>
                    {/* <p>Past Day %:</p> */}
                    {coin?.price_change_percentage_24h >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin?.price_change_percentage_24h.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin?.price_change_percentage_24h.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              )}

              {currentChartPeriod === "week" ? (
                <div className={styles.selected_card}>
                  <div className={styles.card_description}>
                    <p>Week Gain/Loss</p>
                    {/* <h3></h3> */}
                    {coin?.price_change_percentage_7d >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin?.price_change_percentage_7d.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin?.price_change_percentage_7d.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.card_description}>
                    <p>Week Gain/Loss</p>
                    {/* <h3></h3> */}
                    {coin?.price_change_percentage_7d >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin?.price_change_percentage_7d.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin?.price_change_percentage_7d.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              )}

              {currentChartPeriod === "month" ? (
                <div className={styles.selected_card}>
                  <div className={styles.card_description}>
                    <p>Month Gain/Loss:</p>
                    {coin?.price_change_percentage_30d >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin?.price_change_percentage_30d.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin?.price_change_percentage_30d.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.card_description}>
                    <p>Month Gain/Loss:</p>
                    {coin?.price_change_percentage_30d >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin?.price_change_percentage_30d.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin?.price_change_percentage_30d.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              )}

              {currentChartPeriod === "year" ? (
                <div className={styles.selected_card}>
                  <div className={styles.card_description}>
                    {/* <p>Past Year:</p> */}
                    <p>Year Gain/Loss</p>
                    {/* <h3></h3> */}
                    {coin?.price_change_percentage_1y >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin?.price_change_percentage_1y.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin?.price_change_percentage_1y.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.card_description}>
                    <p>Year Gain/Loss</p>
                    {/* <h3></h3> */}
                    {coin?.price_change_percentage_1y >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin?.price_change_percentage_1y.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin?.price_change_percentage_1y.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coin;

export async function getServerSideProps(context) {
  const { id } = context.params;
  const currency = "CAD";

  const cookies = parse(context.req.headers.cookie || "");
  const preloadedCoins = JSON.parse(cookies.preloadedCoins || "[]");
  const globalCacheVersion = cookies.globalCacheVersion || "0";
  const currentTimestamp = Date.now();
  const fiveMinutesInMilliseconds = 5 * 60 * 1000;

  let initialCoinsState = defaultInitialCoinsState;
  let initialCurrencyState = defaultInitialCurrencyState;

  let initialCoin,
    marketChartFromServer,
    marketValuesFromServer,
    chartFromServer,
    initialRates;

  // If the coin is preloaded and the globalCacheVersion is recent (within 5 minutes), don't fetch new data
  if (
    preloadedCoins.includes(id) &&
    currentTimestamp - parseInt(globalCacheVersion) < fiveMinutesInMilliseconds
  ) {
    console.log("use cached data for coins page!");
    return { props: { ...context.pageProps } };
  }
  console.log("fetch new data for coins page...");

  try {
    const coinDetails = await fetchCoinDetailsFromCryptoCompare(id, currency);

    initialCoin = coinDetails.initialCoin;
    marketChartFromServer = coinDetails.marketChartFromServer;
    marketValuesFromServer = coinDetails.marketValuesFromServer;
    chartFromServer = coinDetails.chartFromServer;
    initialRates = coinDetails.initialRates;

    return {
      props: {
        initialReduxState: {
          coins: {
            ...initialCoinsState,
            selectedCoinDetails: {
              coinInfo: initialCoin,
              marketChartValues: marketChartFromServer,
              marketValues: marketValuesFromServer,
              chartValues: chartFromServer,
            },
            selectedCoinDetailsByCurrency: {
              ...initialCoinsState.selectedCoinDetailsByCurrency,
              [initialCurrencyState.initialCurrency]: {
                coinInfo: initialCoin,
                marketChartValues: marketChartFromServer,
                marketValues: marketValuesFromServer,
                chartValues: chartFromServer,
              },
            },
            cachedCoinDetailsByCurrency: {
              ...initialCoinsState.cachedCoinDetailsByCurrency,
              [initialCurrencyState.initialCurrency]: {
                [initialCoin.symbol.toUpperCase()]: {
                  coinInfo: initialCoin,
                  marketChartValues: marketChartFromServer,
                  marketValues: marketValuesFromServer,
                  chartValues: chartFromServer,
                },
              },
            },
          },
          currency: {
            ...initialCurrencyState,
            currencyRates: initialRates,
          },
        },
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        initialReduxState: {
          coins: initialCoinsState,
          currency: initialCurrencyState,
        },
      },
    };
  }
}
