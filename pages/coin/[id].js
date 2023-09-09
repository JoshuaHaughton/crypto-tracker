import React, { useEffect, useState, useRef } from "react";
import HistoryChart from "../../src/components/UI/HistoryChart";
import styles from "./Coin.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../../src/store/coins";
import Link from "next/link";

export const convertCurrency = (value, fromCurrency, toCurrency, allRates) => {
  return value * allRates[fromCurrency][toCurrency];
};

const Coin = ({
  initialCoin,
  marketChartFromServer,
  marketValuesFromServer,
  rates,
}) => {
  const coinListCoins = useSelector((state) => state.coins.coinListCoins);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const currentCurrency = useSelector((state) => state.currency.currency);
  const cachedCurrency = useSelector((state) =>
    state.currency.cachedCurrency.toUpperCase(),
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
  const [chartData, setChartData] = useState({
    labels: marketChartFromServer?.day.map((data) =>
      new Date(data[0]).toLocaleTimeString(),
    ),
    datasets: [
      {
        label: `${
          coin.name
        } Price (Past day) in ${currentCurrency.toUpperCase()}`,
        data: marketValues.dayMarketValues,
        type: "line",
        pointRadius: 1.3,
        borderColor: "#ff9500",
      },
    ],
  });

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
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }

    if (firstRender.current) {
      if (coinListCoins.length === 0) {
        const prefetchHomePage = async () => {
          console.log("prefetchHomePage");
          const cryptoCompareApiKey =
            process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;
          const fetchOptions = {
            headers: {
              Authorization: `Apikey ${cryptoCompareApiKey}`,
            },
          };

          const urls = [
            `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=100&tsym=${currentCurrency.toUpperCase()}`,
          ];

          const [marketCapCoinsData] = await Promise.all(
            urls.map((url) =>
              fetch(url, fetchOptions).then((resp) => resp.json()),
            ),
          );
          console.log("marketCapCoinsData", marketCapCoinsData);

          const allFormattedCoins = marketCapCoinsData.Data.map((entry, i) => {
            const coin = entry.CoinInfo;
            const metrics = entry.RAW?.[currentCurrency.toUpperCase()];
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

          const formattedTrendingCoins = allFormattedCoins.slice(0, 10);
          console.log("formattedTrendingCoins", formattedTrendingCoins);

          // Dispatch the action with the new formatted coins
          dispatch(
            coinsActions.updateCoins({
              coinListCoins: allFormattedCoins,
              trendingCarouselCoins: formattedTrendingCoins,
              symbol: currentSymbol,
            }),
          );
        };

        prefetchHomePage();
      }
      firstRender.current = false;
      return;
    }

    const updateSelectedCoinCurrencyValues = () => {
      // Convert the initial coin values using the rates
      const updatedCoinPrice = convertCurrency(
        coin.current_price,
        cachedCurrency.toUpperCase(),
        currentCurrency.toUpperCase(),
        rates,
      );
      const updatedMarketCap = convertCurrency(
        coin.market_cap,
        cachedCurrency.toUpperCase(),
        currentCurrency.toUpperCase(),
        rates,
      );
      const updatedAth = convertCurrency(
        coin.all_time_high,
        cachedCurrency.toUpperCase(),
        currentCurrency.toUpperCase(),
        rates,
      );
      const updatedPriceChange1d = convertCurrency(
        coin.price_change_1d,
        cachedCurrency.toUpperCase(),
        currentCurrency.toUpperCase(),
        rates,
      );

      // Update the coin values
      setCoin((prevState) => ({
        ...prevState,
        current_price: updatedCoinPrice,
        market_cap: updatedMarketCap,
        all_time_high: updatedAth,
        price_change_1d: updatedPriceChange1d,
      }));

      // Update market chart and values
      setMarketChart((prevState) => ({
        ...prevState,
        day: prevState.day.map((dataPoint) => [
          dataPoint[0],
          convertCurrency(
            dataPoint[1],
            cachedCurrency.toUpperCase(),
            currentCurrency,
            rates,
          ),
        ]),
        week: prevState.week.map((dataPoint) => [
          dataPoint[0],
          convertCurrency(
            dataPoint[1],
            cachedCurrency.toUpperCase(),
            currentCurrency,
            rates,
          ),
        ]),
        month: prevState.month.map((dataPoint) => [
          dataPoint[0],
          convertCurrency(
            dataPoint[1],
            cachedCurrency.toUpperCase(),
            currentCurrency,
            rates,
          ),
        ]),
        year: prevState.year.map((dataPoint) => [
          dataPoint[0],
          convertCurrency(
            dataPoint[1],
            cachedCurrency.toUpperCase(),
            currentCurrency,
            rates,
          ),
        ]),
      }));

      setMarketValues((prevState) => ({
        dayMarketValues: prevState.dayMarketValues.map(
          (value) => value * rates[currentCurrency.toUpperCase()],
        ),
        weekMarketValues: prevState.weekMarketValues.map(
          (value) => value * rates[currentCurrency.toUpperCase()],
        ),
        monthMarketValues: prevState.monthMarketValues.map(
          (value) => value * rates[currentCurrency.toUpperCase()],
        ),
        yearMarketValues: prevState.yearMarketValues.map(
          (value) => value * rates[currentCurrency.toUpperCase()],
        ),
      }));

      // Update chart data
      setChartData((prevState) => ({
        ...prevState,
        datasets: prevState.datasets.map((dataset) => ({
          ...dataset,
          label: `${
            dataset.label.split(" ").slice(0, -1).join(" ") +
            " " +
            currentCurrency.toUpperCase()
          }`,
          data: dataset.data.map((value) =>
            convertCurrency(
              value,
              cachedCurrency.toUpperCase(),
              currentCurrency.toUpperCase(),
              rates,
            ),
          ),
        })),
      }));
    };

    const updateHomePageCoinsWithNewCurrency = async () => {
      console.log("updateHomePageCoinsWithNewCurrency");
      const updatedCoins = coinListCoins.map((coin) => ({
        ...coin,
        current_price: convertCurrency(
          coin.current_price,
          cachedCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          rates,
        ),
        market_cap: convertCurrency(
          coin.market_cap,
          cachedCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          rates,
        ),
        total_volume: convertCurrency(
          coin.total_volume,
          cachedCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          rates,
        ),
        high_24h: convertCurrency(
          coin.high_24h,
          cachedCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          rates,
        ),
        low_24h: convertCurrency(
          coin.low_24h,
          cachedCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          rates,
        ),
        price_change_24h: convertCurrency(
          coin.price_change_24h,
          cachedCurrency.toUpperCase(),
          currentCurrency.toUpperCase(),
          rates,
        ),
      }));

      const updatedCarouselCoins = updatedCoins.slice(0, 10);

      // Dispatch the action with the new formatted coins
      dispatch(
        coinsActions.updateCoins({
          coinListCoins: updatedCoins,
          trendingCarouselCoins: updatedCarouselCoins,
          symbol: currentSymbol,
        }),
      );
    };

    updateSelectedCoinCurrencyValues();
    updateHomePageCoinsWithNewCurrency();
  }, [currentCurrency]);

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.coin_info}>
          <Link href="/" className={styles.back_link}>
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

            {/* <div className={styles.info_row}>
              <h3>Rank:</h3>
              <p className={styles.current}>{coin.coingecko_rank}</p>
            </div> */}
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
            {/* <div className={styles.info_row}>
              <h3>All Time Low:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {coin.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                  minimumFractionDigits: 2,
                })}
              </p>
            </div> */}
            {/* <div className={styles.info_row}>
              <h3>Total Supply:</h3>
              <p className={styles.current}>{coin?.total_supply}</p>
            </div>
            <div className={styles.info_row}>
              <h3>Circulating Supply:</h3>
              <p className={styles.current}>
                {coin?.circulating_supply}
              </p>
            </div> */}
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
                    `${currentSymbol}${coin?.price_change_1d.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      },
                    )}`}
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
  const { id } = context.query;
  const currency = "CAD";
  const cryptoCompareApiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;

  const cryptoCompareFetchOptions = {
    headers: {
      Authorization: `Apikey ${cryptoCompareApiKey}`,
    },
  };

  const urls = [
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${id.toUpperCase()},CAD&tsyms=USD,AUD,GBP,CAD`,
    `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${id.toUpperCase()}`,
    `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${id}&tsym=${currency}&limit=24`,
    `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${id}&tsym=${currency}&limit=365`,
    `https://api.coinpaprika.com/v1/search?q=${id}`,
  ];

  // Execute all requests concurrently
  const [
    cryptoCompareData,
    assetDataR,
    dayData,
    yearData,
    coinPaprikaSearchData,
  ] = await Promise.all(
    urls.map((url) =>
      fetch(url, cryptoCompareFetchOptions).then((res) => res.json()),
    ),
  );

  const rates = {
    CAD: {
      CAD: 1,
      USD: cryptoCompareData.RAW.CAD.USD.PRICE,
      AUD: cryptoCompareData.RAW.CAD.AUD.PRICE,
      GBP: cryptoCompareData.RAW.CAD.GBP.PRICE,
    },
    USD: {
      CAD: 1 / cryptoCompareData.RAW.CAD.USD.PRICE,
      USD: 1,
      AUD:
        cryptoCompareData.RAW.CAD.AUD.PRICE /
        cryptoCompareData.RAW.CAD.USD.PRICE,
      GBP:
        cryptoCompareData.RAW.CAD.GBP.PRICE /
        cryptoCompareData.RAW.CAD.USD.PRICE,
    },
    AUD: {
      CAD: 1 / cryptoCompareData.RAW.CAD.AUD.PRICE,
      USD:
        cryptoCompareData.RAW.CAD.USD.PRICE /
        cryptoCompareData.RAW.CAD.AUD.PRICE,
      AUD: 1,
      GBP:
        cryptoCompareData.RAW.CAD.GBP.PRICE /
        cryptoCompareData.RAW.CAD.AUD.PRICE,
    },
    GBP: {
      CAD: 1 / cryptoCompareData.RAW.CAD.GBP.PRICE,
      USD:
        cryptoCompareData.RAW.CAD.USD.PRICE /
        cryptoCompareData.RAW.CAD.GBP.PRICE,
      AUD:
        cryptoCompareData.RAW.CAD.AUD.PRICE /
        cryptoCompareData.RAW.CAD.GBP.PRICE,
      GBP: 1,
    },
  };

  const coinData = cryptoCompareData.RAW[id.toUpperCase()][currency];
  const assetData = assetDataR.Data;

  // Derive 7-day and 30-day data from the 365-day data
  const weekData = {
    Data: {
      Data: yearData.Data.Data.slice(-7),
    },
  };
  const monthData = {
    Data: {
      Data: yearData.Data.Data.slice(-30), // Last 30 days data
    },
  };

  // Extracting and formatting chart and market data
  const marketChartFromServer = {
    day: dayData.Data.Data.map((data) => [data.time, data.close]),
    week: weekData.Data.Data.map((data) => [data.time, data.close]),
    month: monthData.Data.Data.map((data) => [data.time, data.close]),
    year: yearData.Data.Data.map((data) => [data.time, data.close]),
  };

  const marketValuesFromServer = {
    dayMarketValues: dayData.Data.Data.map((data) => data.close),
    weekMarketValues: weekData.Data.Data.map((data) => data.close),
    monthMarketValues: monthData.Data.Data.map((data) => data.close),
    yearMarketValues: yearData.Data.Data.map((data) => data.close),
  };

  // Extract necessary data points
  const data365 = yearData.Data.Data;
  const data30 = data365.slice(-30);
  const data7 = data365.slice(-7);
  const data1 = data365.slice(-1);

  // Calculate price changes
  const priceChange1d = data1[0].close - data365[data365.length - 2].close;
  const priceChange7d = data7[data7.length - 1].close - data7[0].close;
  const priceChange30d = data30[data30.length - 1].close - data30[0].close;
  const priceChange365d = data365[data365.length - 1].close - data365[0].close;

  // Calculate percentage changes
  const priceChangePercentage1d =
    (priceChange1d / data365[data365.length - 2].close) * 100;
  const priceChangePercentage7d = (priceChange7d / data7[0].close) * 100;
  const priceChangePercentage30d = (priceChange30d / data30[0].close) * 100;
  const priceChangePercentage365d = (priceChange365d / data365[0].close) * 100;

  // Verify if the coin exists on Coinpaprika
  if (
    !coinPaprikaSearchData.currencies ||
    coinPaprikaSearchData.currencies.length === 0
  ) {
    throw new Error("Coin not found on Coinpaprika");
  }

  // Fetch ATH from Coinpaprika
  const coinPaprikaId = coinPaprikaSearchData.currencies[0].id;
  const coinPaprikaCoinDetailsResponse = await fetch(
    `https://api.coinpaprika.com/v1/tickers/${coinPaprikaId}`,
  );
  const coinPaprikaCoinDetails = await coinPaprikaCoinDetailsResponse.json();

  // Extract the ATH from Coinpaprika's response
  const cadAthPrice =
    coinPaprikaCoinDetails.quotes.USD.ath_price * rates.USD.CAD;

  if (
    !cryptoCompareData ||
    !cryptoCompareData.RAW ||
    !cryptoCompareData.RAW[id.toUpperCase()]
  ) {
    return { notFound: true };
  }

  // Construct the coin information
  const coinInfo = {
    id,
    symbol: coinData.FROMSYMBOL,
    name: assetData.NAME,
    image: assetData.LOGO_URL,
    description: assetData.ASSET_DESCRIPTION_SUMMARY,
    current_price: coinData.PRICE,
    all_time_high: cadAthPrice,
    market_cap: coinData.MKTCAP,
    price_change_1d: priceChange1d,
    price_change_percentage_24h: priceChangePercentage1d,
    price_change_7d: priceChange7d,
    price_change_percentage_7d: priceChangePercentage7d,
    price_change_30d: priceChange30d,
    price_change_percentage_30d: priceChangePercentage30d,
    price_change_365d: priceChange365d,
    price_change_percentage_1y: priceChangePercentage365d,
  };

  return {
    props: {
      initialCoin: coinInfo,
      marketChartFromServer,
      marketValuesFromServer,
      rates,
    },
  };
}
