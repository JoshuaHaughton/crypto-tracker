import React, { useEffect, useState, useRef } from "react";
import HistoryChart from "../../src/components/UI/HistoryChart";
import styles from "./Coin.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../../src/store/coins";
import Link from "next/link";
import { currencyActions } from "../../src/store/currency";
import { convertCurrency } from "../../src/utils/currency.utils";
import db from "../../src/utils/database";
import { initializeCoinListCache } from "../../src/thunks/coinListCacheThunk";
import {
  fetchBaseDataFromCryptoCompare,
  fetchCoinDetailsFromCryptoCompare,
} from "../../src/utils/api.utils";

const Coin = ({
  initialCoin,
  marketChartFromServer,
  marketValuesFromServer,
  chartFromServer,
  initialRates,
}) => {
  const displayedCoinListCoins = useSelector(
    (state) => state.coins.displayedCoinListCoins,
  );
  const currencyRates = useSelector((state) => state.currency.currencyRates);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const selectedCoinDetailsByCurrency = useSelector(
    (state) => state.coins.selectedCoinDetailsByCurrency,
  );
  const currentCurrency = useSelector(
    (state) => state.currency.currentCurrency,
  );
  const initialCurrency = useSelector((state) =>
    state.currency.initialCurrency.toUpperCase(),
  );

  const dispatch = useDispatch();
  const [coin, setCoin] = useState(initialCoin);
  const [currentChartPeriod, setCurrentChartPeriod] = useState("day");
  const isHydrated = useRef(false);
  const firstRender = useRef(true);
  const [marketChart, setMarketChart] = useState(marketChartFromServer || []);
  const [marketValues, setMarketValues] = useState(
    marketValuesFromServer || [],
  );
  const [chartData, setChartData] = useState(chartFromServer);

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
    const currencyTransformerWorker = new Worker(
      "/webWorkers/currencyTransformerWorker.js",
    );

    // Define the message handler for the worker
    const handleWorkerMessage = (e) => {
      console.log(e.data);
      const { transformedData } = e.data;

      // Dispatch initial data for the current currency
      dispatch(
        coinsActions.updateSelectedCoinDetailsForCurrency({
          currency: currentCurrency.toUpperCase(),
          coinDetail: initialCoin,
        }),
      );

      // Update IndexedDB with the fresh coin details
      db.coinDetails.put({
        currency: currentCurrency.toUpperCase(),
        details: initialCoin,
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
    currencyTransformerWorker.addEventListener("message", handleWorkerMessage);

    // If initialCoin and initialRates are available, post data to the worker
    if (initialCoin && initialRates) {
      currencyTransformerWorker.postMessage({
        type: "transformCoin",
        data: {
          coin: initialCoin,
          rates: initialRates,
          currentCurrency: currentCurrency.toUpperCase(),
        },
      });
    }

    // Cleanup: remove the event listener and terminate the worker when the component is unmounted
    return () => {
      console.log("unmount coin worker");
      currencyTransformerWorker.removeEventListener(
        "message",
        handleWorkerMessage,
      );
      currencyTransformerWorker.terminate();
    };
  }, [isHydrated]);

  useEffect(() => {
    // should do if t either the cache isnt valid or on page revalidates (new data)
    const prefetchHomePage = async () => {
      console.log("prefetchHomePage");

      const { initialRates, initialHundredCoins, trendingCarouselCoins } =
        await fetchBaseDataFromCryptoCompare();

      // Dispatch the action with the new formatted coins
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
    };

    prefetchHomePage();
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

    const updateSelectedCoinCurrencyValues = () => {
      console.log("updateSelectedCoinCurrencyValues");

      // Check if coin data for the current currency exists in the Redux store
      if (selectedCoinDetailsByCurrency[currentCurrency.toUpperCase()]) {
        console.log("currency cache used");
        setCoin(selectedCoinDetailsByCurrency[currentCurrency.toUpperCase()]);
        // TODO: Update marketChart, marketValues, and chartData similarly if stored in Redux
      } else {
        // Convert the initial coin values using the initialRates
        const updatedCoinPrice = convertCurrency(
          initialCoin.current_price,
          initialCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          initialRates,
        );
        const updatedMarketCap = convertCurrency(
          initialCoin.market_cap,
          initialCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          initialRates,
        );
        const updatedAth = convertCurrency(
          initialCoin.all_time_high,
          initialCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          initialRates,
        );
        const updatedPriceChange1d = convertCurrency(
          initialCoin.price_change_1d,
          initialCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          initialRates,
        );

        // Update the coin values
        setCoin((prevState) => ({
          ...prevState,
          current_price: updatedCoinPrice,
          market_cap: updatedMarketCap,
          all_time_high: updatedAth,
          price_change_1d: updatedPriceChange1d,
        }));

        dispatch(
          coinsActions.updateSelectedCoinDetailsForCurrency({
            currency: currentCurrency.toUpperCase(),
            coinDetail: {
              ...coin,
              current_price: updatedCoinPrice,
              market_cap: updatedMarketCap,
              all_time_high: updatedAth,
              price_change_1d: updatedPriceChange1d,
            },
          }),
        );

        // Update IndexedDB with the transformed coin details
        db.coinDetails.put({
          currency: currentCurrency.toUpperCase(),
          details: {
            ...coin,
            current_price: updatedCoinPrice,
            market_cap: updatedMarketCap,
            all_time_high: updatedAth,
            price_change_1d: updatedPriceChange1d,
          },
        });
      }

      // Update market chart and values
      setMarketChart(() => ({
        ...marketChartFromServer,
        day: marketChartFromServer.day.map((dataPoint) => [
          dataPoint[0],
          convertCurrency(
            dataPoint[1],
            initialCurrency.toUpperCase(),
            currentCurrency,
            initialRates,
          ),
        ]),
        week: marketChartFromServer.week.map((dataPoint) => [
          dataPoint[0],
          convertCurrency(
            dataPoint[1],
            initialCurrency.toUpperCase(),
            currentCurrency,
            initialRates,
          ),
        ]),
        month: marketChartFromServer.month.map((dataPoint) => [
          dataPoint[0],
          convertCurrency(
            dataPoint[1],
            initialCurrency.toUpperCase(),
            currentCurrency,
            initialRates,
          ),
        ]),
        year: marketChartFromServer.year.map((dataPoint) => [
          dataPoint[0],
          convertCurrency(
            dataPoint[1],
            initialCurrency.toUpperCase(),
            currentCurrency,
            initialRates,
          ),
        ]),
      }));

      setMarketValues(() => ({
        dayMarketValues: marketValuesFromServer.dayMarketValues.map(
          (value) =>
            value *
            initialRates[initialCurrency.toUpperCase()][
              currentCurrency.toUpperCase()
            ],
        ),
        weekMarketValues: marketValuesFromServer.weekMarketValues.map(
          (value) =>
            value *
            initialRates[initialCurrency.toUpperCase()][
              currentCurrency.toUpperCase()
            ],
        ),
        monthMarketValues: marketValuesFromServer.monthMarketValues.map(
          (value) =>
            value *
            initialRates[initialCurrency.toUpperCase()][
              currentCurrency.toUpperCase()
            ],
        ),
        yearMarketValues: marketValuesFromServer.yearMarketValues.map(
          (value) =>
            value *
            initialRates[initialCurrency.toUpperCase()][
              currentCurrency.toUpperCase()
            ],
        ),
      }));

      // Update chart data
      setChartData(() => ({
        ...chartFromServer,
        datasets: chartFromServer.datasets.map((dataset) => ({
          ...dataset,
          label: `${
            dataset.label.split(" ").slice(0, -1).join(" ") +
            " " +
            currentCurrency.toUpperCase()
          }`,
          data: dataset.data.map((value) =>
            convertCurrency(
              value,
              initialCurrency.toUpperCase(),
              currentCurrency.toUpperCase(),
              initialRates,
            ),
          ),
        })),
      }));
    };

    updateSelectedCoinCurrencyValues();
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
  try {
    const { id } = context.query;
    const currency = "CAD";
    const coinDetails = await fetchCoinDetailsFromCryptoCompare(id, currency);

    return {
      props: coinDetails,
    };
  } catch (err) {
    console.log(err);
  }
}
