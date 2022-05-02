import React, { useEffect, useState } from "react";
import HistoryChart from "../../components/UI/HistoryChart";
import styles from "./Coin.module.css";
import { Chart as ChartJS } from "chart.js/auto";
import Image from "next/image";
// import { ResponsiveContainer, AreaChart, XAxis, YAxis, Area, Tooltip, CartesianGrid } from 'recharts';
const Coin = ({ coin, market_chart, market_values }) => {
  const [chartData, setChartData] = useState({
    labels: market_chart.day.map((data) =>
      new Date(data[0]).toLocaleTimeString(),
    ),
    datasets: [
      {
        label: `${coin.name} Price (Past day) in CAD`,
        data: market_values.dayMarketValues,
        type: "line",
        pointRadius: 1.3,
        borderColor: "#ff9500",
      },
    ],
  });

  // {
  //   labels: starterChartInfo.marketLabels.oneDayLabels,
  //   datasets: [ {
  //   label: "Price (Past 1 day) in CAD",
  //   data: starterChartInfo.marketValues.oneDayValues,
  //   backgroundColor: ["red"],
  //   fill: "origin",
  //   pointRadius: 1.5,
  //   pointStyle: 'circle'
  // }] }

  const [currentChartPeriod, setCurrentChartPeriod] = useState("day");

  console.log(coin);
  console.log("resultsDay etc.", chartData.day);

  const dayClickHandler = () => {
    setChartData((prev) => {
      return {
        labels: market_chart.day.map((data) =>
          new Date(data[0]).toLocaleTimeString(),
        ),
        datasets: [
          {
            label: `${coin.name} Price (Past day) in CAD`,
            data: market_values.dayMarketValues,
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
        labels: market_chart.week.map((data) =>
          new Date(data[0]).toLocaleDateString(),
        ),
        datasets: [
          {
            label: `${coin.name} Price (Past week) in CAD`,
            data: market_values.weekMarketValues,
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
      console.log(market_chart);
      return {
        labels: market_chart.month.map((data) =>
          new Date(data[0]).toLocaleDateString(),
        ),
        datasets: [
          {
            label: `${coin.name} Price (Past month) in CAD`,
            data: market_values.monthMarketValues,
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
        labels: market_chart.year.map((data) =>
          new Date(data[0]).toLocaleDateString(),
        ),
        datasets: [
          {
            label: `${coin.name} Price (Past year) in CAD`,
            data: market_values.yearMarketValues,
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

  console.log(removeHTML(coin.description.en));

  console.log(coin.market_data.price_change_24h);

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.coin_info}>
          <header className={styles.header}>
            <div className={styles.title_wrapper}>
              <Image
                src={coin.image.large}
                alt={coin.name}
                width={160}
                height={160}
                className={styles.image}
              />
              <h1 className={styles.name}>{coin.name}</h1>
              <h4 className={styles.symbol}>{coin.symbol.toUpperCase()}</h4>
            </div>
          </header>

          <div className={styles.info_card}>
            <div className={styles.description}>
              {coin.description.en.split(".").length > 2
                ? `${removeHTML(coin.description.en)
                    .split(".")
                    .slice(0, 2)
                    .join(". ")}.`
                : `${removeHTML(coin.description.en).slice(0, 170)}...`}
            </div>

            <div className={styles.info_row}>
              <h3>Current Price:</h3>
              <p className={styles.current}>
                $
                {coin.market_data.current_price.cad.toLocaleString("en-US", {
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
                $
                {coin.market_data.ath.cad.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                  minimumFractionDigits: 2
                })}
              </p>
            </div>
            <div className={styles.info_row}>
              <h3>All Time Low:</h3>
              <p className={styles.current}>
                $
                {coin.market_data.atl.cad.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                })}
              </p>
            </div>
            {/* <div className={styles.info_row}>
              <h3>Total Supply:</h3>
              <p className={styles.current}>{coin.market_data.total_supply}</p>
            </div>
            <div className={styles.info_row}>
              <h3>Circulating Supply:</h3>
              <p className={styles.current}>
                {coin.market_data.circulating_supply}
              </p>
            </div> */}
            <div className={styles.info_row}>
              <h3>24h Price Change:</h3>
              {+coin.market_data.price_change_24h > 0 ? (
                <p className={styles.current}>
                  {+coin.market_data.price_change_24h < 1 &&
                    `$${coin.market_data.price_change_24h}`}
                  {+coin.market_data.price_change_24h > 1 &&
                    `$${coin.market_data.price_change_24h.toFixed(2)}`}
                </p>
              ) : (
                <p className={styles.current}>
                  {+coin.market_data.price_change_24h < -1 &&
                    `${coin.market_data.price_change_24h.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      },
                    )}`}
                  {+coin.market_data.price_change_24h > -1 &&
                    `-$${Math.abs(coin.market_data.price_change_24h).toFixed(
                      8,
                    )}`}
                </p>
              )}
            </div>
            <div className={styles.info_row}>
              <h3>Market Cap:</h3>
              <p className={styles.current}>
                ${bigNumberFormatter(coin.market_data.market_cap.cad)}
              </p>
            </div>
            <div className={styles.info_row}>
              <h3>Total Volume:</h3>
              <p className={styles.current}>
                $
                {coin.market_data.total_volume.cad.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                })}
              </p>
            </div>
          </div>
          {/* <p className={styles.symbol}>{coin.symbol.toUpperCase()}</p> */}
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
                    {coin.market_data.price_change_percentage_24h >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin.market_data.price_change_percentage_24h.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_24h.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.card_description}>
                    <p>Day Gain/Loss</p>
                    {/* <p>Past Day %:</p> */}
                    {coin.market_data.price_change_percentage_24h >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin.market_data.price_change_percentage_24h.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_24h.toFixed(3)}%
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
                    {coin.market_data.price_change_percentage_7d >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin.market_data.price_change_percentage_7d.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_7d.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.card_description}>
                    <p>Week Gain/Loss</p>
                    {/* <h3></h3> */}
                    {coin.market_data.price_change_percentage_7d >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin.market_data.price_change_percentage_7d.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_7d.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              )}

              {currentChartPeriod === "month" ? (
                <div className={styles.selected_card}>
                  <div className={styles.card_description}>
                    <p>Month Gain/Loss:</p>
                    {coin.market_data.price_change_percentage_30d >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin.market_data.price_change_percentage_30d.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_30d.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.card_description}>
                    <p>Month Gain/Loss:</p>
                    {coin.market_data.price_change_percentage_30d >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin.market_data.price_change_percentage_30d.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_30d.toFixed(3)}%
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
                    {coin.market_data.price_change_percentage_1y >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin.market_data.price_change_percentage_1y.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_1y.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.card_description}>
                    <p>Year Gain/Loss</p>
                    {/* <h3></h3> */}
                    {coin.market_data.price_change_percentage_1y >= 0 ? (
                      <h3 className={styles.green}>
                        +{coin.market_data.price_change_percentage_1y.toFixed(3)}%
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_1y.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <div className={styles.chart_details}>
            <div className={styles.chart_title}>
              <h3>Percentage Change</h3>
            </div>
            {currentChartPeriod === "day" ? (
              <>
                <div className={styles.selected_period}>
                  <p>Percentage change for the past day: </p>
                  {coin.market_data.price_change_percentage_24h >= 0 ? (
                    <p className={styles.green}>
                      {" "}
                      {coin.market_data.price_change_percentage_24h}%
                    </p>
                  ) : (
                    <p className={styles.red}>
                      {" "}
                      {coin.market_data.price_change_percentage_24h}%
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <p>Percentage change for the past day: </p>
                  {coin.market_data.price_change_percentage_24h >= 0 ? (
                    <p className={styles.green}>
                      {coin.market_data.price_change_percentage_24h}%
                    </p>
                  ) : (
                    <p className={styles.red}>
                      {coin.market_data.price_change_percentage_24h}%
                    </p>
                  )}
                </div>
              </>
            )}

            {currentChartPeriod === "week" ? (
              <>
                <div className={styles.selected_period}>
                  <p>Percentage change for the past week: </p>
                  {coin.market_data.price_change_percentage_7d >= 0 ? (
                    <p className={styles.green}>
                      {coin.market_data.price_change_percentage_7d}%
                    </p>
                  ) : (
                    <p className={styles.red}>
                      {" "}
                      {coin.market_data.price_change_percentage_7d}%
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <p>Percentage change for the past week: </p>
                  {coin.market_data.price_change_percentage_7d >= 0 ? (
                    <p className={styles.green}>
                      {coin.market_data.price_change_percentage_7d}%
                    </p>
                  ) : (
                    <p className={styles.red}>
                      {" "}
                      {coin.market_data.price_change_percentage_7d}%
                    </p>
                  )}
                </div>
              </>
            )}

            {currentChartPeriod === "month" ? (
              <>
                <div className={styles.selected_period}>
                  <p>Percentage change for the past month: </p>
                  {coin.market_data.price_change_percentage_30d >= 0 ? (
                    <p className={styles.green}>
                      {coin.market_data.price_change_percentage_30d}%
                    </p>
                  ) : (
                    <p className={styles.red}>
                      {" "}
                      {coin.market_data.price_change_percentage_30d}%
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <p>Percentage change for the past month: </p>
                  {coin.market_data.price_change_percentage_30d >= 0 ? (
                    <p className={styles.green}>
                      {coin.market_data.price_change_percentage_30d}%
                    </p>
                  ) : (
                    <p className={styles.red}>
                      {" "}
                      {coin.market_data.price_change_percentage_30d}%
                    </p>
                  )}
                </div>
              </>
            )}

            {currentChartPeriod === "year" ? (
              <>
                <div className={styles.selected_period}>
                  <p>Percentage change for the past year: </p>
                  {coin.market_data.price_change_percentage_1y >= 0 ? (
                    <p className={styles.green}>
                      {coin.market_data.price_change_percentage_1y}%
                    </p>
                  ) : (
                    <p className={styles.red}>
                      {" "}
                      {coin.market_data.price_change_percentage_1y}%
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <p>Percentage change for the past year: </p>
                  {coin.market_data.price_change_percentage_1y >= 0 ? (
                    <p className={styles.green}>
                      {coin.market_data.price_change_percentage_1y}%
                    </p>
                  ) : (
                    <p className={styles.red}>
                      {" "}
                      {coin.market_data.price_change_percentage_1y}%
                    </p>
                  )}
                </div>
              </>
            )}
          </div> */}
        </div>
      </div>

      {/* <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
        </AreaChart>
      </ResponsiveContainer> */}
    </div>
  );
};

export default Coin;

export async function getServerSideProps(context) {
  const { id } = context.query;

  const urls = [
    `https://api.coingecko.com/api/v3/coins/${id}?vs_currency=cad`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=1`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=7`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=30`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=365`,
  ];

  const coinInfo = await Promise.all(
    urls.map((url) => fetch(url).then((resp) => resp.json())),
  ).then((res) => {
    // console.log('yup', res)
    return res;
  });

  const dayMarketValues = coinInfo[1].prices.map((data) => data[1]);
  const weekMarketValues = coinInfo[2].prices.map((data) => data[1]);
  const monthMarketValues = coinInfo[3].prices.map((data) => data[1]);
  const yearMarketValues = coinInfo[4].prices.map((data) => data[1]);

  return {
    props: {
      coin: coinInfo[0],
      market_chart: {
        day: coinInfo[1].prices,
        week: coinInfo[2].prices,
        month: coinInfo[3].prices,
        year: coinInfo[4].prices,
      },
      market_values: {
        dayMarketValues,
        weekMarketValues,
        monthMarketValues,
        yearMarketValues,
      },
    },
  };
}
