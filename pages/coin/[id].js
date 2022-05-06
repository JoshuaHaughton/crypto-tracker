import React, { useEffect, useRef, useState } from "react";
import HistoryChart from "../../src/components/UI/HistoryChart";
import styles from "./Coin.module.css";
import { Chart as ChartJS } from "chart.js/auto";
import Image from "next/image";
import { FilledInput, Snackbar } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "../../src/components/Coins/Coin";
import { coinsActions } from "../../src/store/coins";
// import { ResponsiveContainer, AreaChart, XAxis, YAxis, Area, Tooltip, CartesianGrid } from 'recharts';
const vertical = 'bottom'
const horizontal = 'center'
const Coin = ({
  initialCoin,
  marketChartFromServer,
  marketValuesFromServer,
  pageId,
}) => {
  const firstUpdate = useRef(true);
  const [coin, setCoin] = useState(initialCoin)
  const [marketValues, setMarketValues] = useState(marketValuesFromServer);
  const [marketChart, setMarketChart] = useState(marketChartFromServer);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const currentCurrency = useSelector((state) => state.currency.currency);
  const dispatch = useDispatch()

  const isBreakpoint1040 = useMediaQuery(1040);

  const [chartData, setChartData] = useState({
    labels: marketChartFromServer?.day.map((data) =>
      new Date(data[0]).toLocaleTimeString(),
    ),
    datasets: [
      {
        label: `${coin.name} Price (Past day) in ${currentCurrency.toUpperCase()}`,
        data: marketValuesFromServer.dayMarketValues,
        type: "line",
        pointRadius: 1.3,
        borderColor: "#ff9500",
      },
    ],
  });
  const router = useRouter();

  // {
  //   labels: starterChartInfo.marketLabels.oneDayLabels,
  //   datasets: [ {
  //   label: "Price (Past 1 day) in ${currentCurrency.toUpperCase()}",
  //   data: starterChartInfo.marketValues?.oneDayValues,
  //   backgroundColor: ["red"],
  //   fill: "origin",
  //   pointRadius: 1.5,
  //   pointStyle: 'circle'
  // }] }

  const [currentChartPeriod, setCurrentChartPeriod] = useState("day");

  const dayClickHandler = () => {
    setChartData((prev) => {
      return {
        labels: marketChart?.day.map((data) =>
          new Date(data[0]).toLocaleTimeString(),
        ),
        datasets: [
          {
            label: `${coin.name} Price (Past day) in ${currentCurrency.toUpperCase()}`,
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
            label: `${coin.name} Price (Past week) in ${currentCurrency.toUpperCase()}`,
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
            label: `${coin.name} Price (Past month) in ${currentCurrency.toUpperCase()}`,
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
            label: `${coin.name} Price (Past year) in ${currentCurrency.toUpperCase()}`,
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

  const goBack = () => {
    router.back();
  };

  const removeHTML = (str) => str.replace(/<\/?[^>]+(>|$)/g, "");

  useEffect(() => {

  

      const setNewCurrency = async () => {
        if (firstUpdate.current) {
          firstUpdate.current = false;
          console.log('true first');
          return;
        } 



        // setOpenNotificationBar(true)

        console.log("setting new cur", currentCurrency);
  
        const urls = [
          `https://api.coingecko.com/api/v3/coins/${pageId}?vs_currency=${currentCurrency}`,
          `https://api.coingecko.com/api/v3/coins/${pageId}/market_chart?vs_currency=${currentCurrency}&days=1`,
          `https://api.coingecko.com/api/v3/coins/${pageId}/market_chart?vs_currency=${currentCurrency}&days=7`,
          `https://api.coingecko.com/api/v3/coins/${pageId}/market_chart?vs_currency=${currentCurrency}&days=30`,
          `https://api.coingecko.com/api/v3/coins/${pageId}/market_chart?vs_currency=${currentCurrency}&days=365`,
        ];
  
        const coinInfo = await Promise.all(
          urls.map((url) => fetch(url).then((resp) => resp.json())),
        );
  
        // const coinListInfo = await (await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`).then((resp) => resp.json()))
  
        // console.log('new coin list', coinListInfo);
  
        // updateCoins(prev => {return {...prev, initialHundredCoins: coinListInfo}})
        // asd
  
        
        
        
        const dayMarketValues = coinInfo[1].prices.map((data) => data[1]);
        const weekMarketValues = coinInfo[2].prices.map((data) => data[1]);
        const monthMarketValues = coinInfo[3].prices.map((data) => data[1]);
        const yearMarketValues = coinInfo[4].prices.map((data) => data[1]);
        // dispatch(coinsActions.updateCoins({coinListCoins: coinInfo[5] , trendingCarouselCoins: coinInfo[6], symbol: currentSymbol}))
        
  
        console.log("setting", coinInfo[0]);
  
        setCoin(coinInfo[0])
        setMarketChart({
          day: coinInfo[1].prices,
          week: coinInfo[2].prices,
          month: coinInfo[3].prices,
          year: coinInfo[4].prices,
        });
        setMarketValues({
          dayMarketValues,
          weekMarketValues,
          monthMarketValues,
          yearMarketValues,
        });
  
        setChartData({
          labels: coinInfo[1].prices.map((data) =>
            new Date(data[0]).toLocaleTimeString(),
          ),
          datasets: [
            {
              label: `${coin.name} Price (Past day) in ${currentCurrency.toUpperCase()}`,
              data: dayMarketValues,
              type: "line",
              pointRadius: 1.3,
              borderColor: "#ff9500",
            },
          ],
        });
  
  
        // setOpenNotificationBar(false)
  
  
  
        //get coin info for main page AFTER coin info page data has been retrieved. Causes loading on coin info page to be faster, and user wont notice since they wont see the main page, and we're fetching it in the background asynchronously
  
  
  
  
        const urls2 = [
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currentCurrency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
        ];
  
  
        Promise.all(urls2.map((u) => fetch(u)))
          .then((responses) => Promise.all(responses.map((res) => res.json())))
          .then((data) => {
            console.log("yebuddy", data);
  
            const hundredNewCoins = data[0];
            const trendingCoins = data[1];
  
            console.log('latest man', hundredNewCoins, trendingCoins)
  
            // updateCoins({initialHundredCoins: hundredNewCoins, trendingCoins});
            dispatch(coinsActions.updateCoins({coinListCoins: hundredNewCoins , trendingCarouselCoins: trendingCoins, symbol: currentSymbol}))
            // setCarouselCoins(trendingCoins);
            // setNonReduxSymbol(currentSymbol);
          });
  
  
  
  
  
  
        
      };


      
      console.log('then false');
      setNewCurrency();
      


    
  }, [currentCurrency]);

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.coin_info}>
          <div onClick={goBack} className={styles.back_link}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <header className={styles.header}>
            <div className={styles.title_wrapper}>
              <Image
                src={coin.image.large}
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
                {coin.description.en.split(".").length > 2
                  ? `${removeHTML(coin.description.en)
                      .split(".")
                      .slice(0, 2)
                      .join(". ")}.`
                  : `${removeHTML(coin.description.en).slice(0, 170)}...`}
              </p>
            </div>
          </header>

          <div className={styles.info_card}>
            <div className={styles.info_row}>
              <h3>Current Price:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {coin.market_data.current_price[currentCurrency].toLocaleString(
                  "en-US",
                  {
                    maximumFractionDigits: 8,
                  },
                )}
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
                {coin.market_data.ath[currentCurrency].toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className={styles.info_row}>
              <h3>All Time Low:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {coin.market_data.atl[currentCurrency].toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                  minimumFractionDigits: 2,
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
            {/* <div className={styles.info_row}>
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
            </div> */}
            <div className={styles.info_row}>
              <h3>Market Cap:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {bigNumberFormatter(coin.market_data.market_cap.cad)}
              </p>
            </div>
            <div className={styles.info_row}>
              <h3>Total Volume:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {!isBreakpoint1040
                  ? coin.market_data.total_volume[
                      currentCurrency
                    ].toLocaleString("en-US", {
                      maximumFractionDigits: 8,
                    })
                  : bigNumberFormatter(
                      coin.market_data.total_volume[currentCurrency],
                    )}
                {}
              </p>
            </div>
            <div className={styles.info_row}>
              <h3>24h Price Change:</h3>
              {+coin.market_data.price_change_24h > 0 ? (
                <p className={styles.current}>
                  {+coin.market_data.price_change_24h < 1 &&
                    `${currentSymbol}${coin.market_data.price_change_24h}`}
                  {+coin.market_data.price_change_24h > 1 &&
                    `${currentSymbol}${coin.market_data.price_change_24h.toFixed(
                      2,
                    )}`}
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
                    `-${currentSymbol}${Math.abs(
                      coin.market_data.price_change_24h,
                    ).toFixed(8)}`}
                </p>
              )}
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
                        +
                        {coin.market_data.price_change_percentage_24h.toFixed(
                          3,
                        )}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_24h.toFixed(
                          3,
                        )}
                        %
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
                        +
                        {coin.market_data.price_change_percentage_24h.toFixed(
                          3,
                        )}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_24h.toFixed(
                          3,
                        )}
                        %
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
                        +
                        {coin.market_data.price_change_percentage_7d.toFixed(3)}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_7d.toFixed(3)}
                        %
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
                        +
                        {coin.market_data.price_change_percentage_7d.toFixed(3)}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_7d.toFixed(3)}
                        %
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
                        +
                        {coin.market_data.price_change_percentage_30d.toFixed(
                          3,
                        )}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_30d.toFixed(
                          3,
                        )}
                        %
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
                        +
                        {coin.market_data.price_change_percentage_30d.toFixed(
                          3,
                        )}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_30d.toFixed(
                          3,
                        )}
                        %
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
                        +
                        {coin.market_data.price_change_percentage_1y.toFixed(3)}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_1y.toFixed(3)}
                        %
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
                        +
                        {coin.market_data.price_change_percentage_1y.toFixed(3)}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coin.market_data.price_change_percentage_1y.toFixed(3)}
                        %
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
  // console.log(context);

  const urls = [
    `https://api.coingecko.com/api/v3/coins/${id}?vs_currency=cad`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=1`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=7`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=30`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=365`,
  ];

  const coinInfo = await Promise.all(
    urls.map((url) => fetch(url).then((resp) => resp.json())));

  const dayMarketValues = coinInfo[1].prices.map((data) => data[1]);
  const weekMarketValues = coinInfo[2].prices.map((data) => data[1]);
  const monthMarketValues = coinInfo[3].prices.map((data) => data[1]);
  const yearMarketValues = coinInfo[4].prices.map((data) => data[1]);

  return {
    props: {
      initialCoin: coinInfo[0],
      marketChartFromServer: {
        day: coinInfo[1].prices,
        week: coinInfo[2].prices,
        month: coinInfo[3].prices,
        year: coinInfo[4].prices,
      },
      marketValuesFromServer: {
        dayMarketValues,
        weekMarketValues,
        monthMarketValues,
        yearMarketValues,
      },
      pageId: id,
    },
  };
}
