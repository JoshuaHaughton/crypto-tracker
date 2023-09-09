import React, { useEffect, useRef, useState } from "react";
import HistoryChart from "../../src/components/UI/HistoryChart";
import styles from "./Coin.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../../src/store/coins";
import Link from "next/link";

const Coin = ({
  initialCoin,
  marketChartFromServer,
  marketValuesFromServer,
  pageId,
  coinData,
  assetData,
  rates,
}) => {
  console.log("initialCoin", initialCoin);
  console.log("coinData", coinData);
  console.log("assetData", assetData);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const currentCurrency = useSelector((state) => state.currency.currency);
  const dispatch = useDispatch();
  const [coin, setCoin] = useState(initialCoin);
  const [currentChartPeriod, setCurrentChartPeriod] = useState("day");
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
    const setNewCurrency = async () => {
      const cryptoCompareApiKey = process.env.NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY;

      const fetchOptions = {
        headers: {
          Authorization: `Apikey ${cryptoCompareApiKey}`,
        },
      };

      const urls = [
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${pageId.toUpperCase()}&tsyms=${currentCurrency}`,
        `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${pageId}&tsym=${currentCurrency}&limit=24`, // 1 day
        `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${pageId}&tsym=${currentCurrency}&limit=7`, // 1 week
        `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${pageId}&tsym=${currentCurrency}&limit=30`, // 1 month
        `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${pageId}&tsym=${currentCurrency}&limit=365`, // 1 year
        `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=100&tsym=${currentCurrency}`,
        `https://min-api.cryptocompare.com/data/top/totalvolfull?limit=10&tsym=${currentCurrency}`,
      ];

      const coinInfo = await Promise.all(
        urls.map((url) => fetch(url, fetchOptions).then((resp) => resp.json())),
      );

      const coinData =
        coinInfo[0].RAW[pageId.toUpperCase()][currentCurrency.toUpperCase()];
      // console.log("retrieved coindata", coinData);
      // console.log("retrieved coininfo", coinInfo);
      // console.log("currentCurrency", currentCurrency);
      const assetData =
        coinInfo[0].DISPLAY[pageId.toUpperCase()][
          currentCurrency.toUpperCase()
        ];
      // console.log("retrieved assetData", assetData);

      // Search for coin ID from Coinpaprika based on coin name
      const searchResponse = await fetch(
        `https://api.coinpaprika.com/v1/search?q=${coinData.FROMSYMBOL}`,
      );
      const searchData = await searchResponse.json();

      // Assuming the first result is the desired coin (additional checks might be needed)
      const coinPaprikaId = searchData.currencies[0].id;

      // Fetch coin details including ATH from Coinpaprika
      const coinDetailsResponse = await fetch(
        `https://api.coinpaprika.com/v1/tickers/${coinPaprikaId}`,
      );
      const coinDetails = await coinDetailsResponse.json();

      // ATH price; Note: ATH might be in USD, you might need conversion based on your requirements
      const athPrice = coinDetails.quotes.USD.ath_price;
      console.log(rates);

      // Convert Coinpaprika's USD values to CAD
      const cadAthPrice = athPrice * rates.CAD;

      const dayMarketValues = coinInfo[1].Data.Data.map((data) => data.close);
      const weekMarketValues = coinInfo[2].Data.Data.map((data) => data.close);
      const monthMarketValues = coinInfo[3].Data.Data.map((data) => data.close);
      const yearMarketValues = coinInfo[4].Data.Data.map((data) => data.close);

      const marketCapCoinsData = coinInfo[5].Data;

      // Format the coins from the marketCapCoinsData
      const allFormattedCoins = marketCapCoinsData
        .map((entry, i) => {
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
            current_price_USD: metrics.PRICE / rates.CAD, // Convert CAD to USD for the client-side option
            current_price_AUD: (metrics.PRICE / rates.CAD) * rates.AUD, // Convert from CAD to USD first, then to AUD
            current_price_GBP: (metrics.PRICE / rates.CAD) * rates.GBP, // Convert from CAD to USD first, then to GBP
            market_cap: metrics.MKTCAP,
            market_cap_rank: i + 1,
            total_volume: metrics.TOTALVOLUME24HTO,
            high_24h: metrics.HIGH24HOUR,
            low_24h: metrics.LOW24HOUR,
            price_change_24h: metrics.CHANGE24HOUR,
            price_change_percentage_24h: metrics.CHANGEPCT24HOUR,
            circulating_supply: metrics.SUPPLY,
          };
        })
        .filter(Boolean);

      // Format the trending coins
      const formattedTrendingCoins = allFormattedCoins.slice(0, 10);

      dispatch(
        coinsActions.updateCoins({
          //this the issue
          coinListCoins: allFormattedCoins,
          trendingCarouselCoins: formattedTrendingCoins,
          symbol: currentSymbol,
        }),
      );

      setCoin({
        id: initialCoin.id,
        symbol: initialCoin.symbol,
        name: initialCoin.name,
        image: initialCoin.image,
        description: initialCoin.description,
        current_price: coinData.PRICE,
        all_time_high: cadAthPrice, // This is previously fetched from Coinpaprika.
        market_cap: coinData.MKTCAP,
        price_change_1d:
          dayMarketValues[dayMarketValues.length - 1] - dayMarketValues[0],
        price_change_percentage_24h:
          ((dayMarketValues[dayMarketValues.length - 1] - dayMarketValues[0]) /
            dayMarketValues[0]) *
          100,
        price_change_7d:
          weekMarketValues[weekMarketValues.length - 1] - weekMarketValues[0],
        price_change_percentage_7d:
          ((weekMarketValues[weekMarketValues.length - 1] -
            weekMarketValues[0]) /
            weekMarketValues[0]) *
          100,
        price_change_30d:
          monthMarketValues[monthMarketValues.length - 1] -
          monthMarketValues[0],
        price_change_percentage_30d:
          ((monthMarketValues[monthMarketValues.length - 1] -
            monthMarketValues[0]) /
            monthMarketValues[0]) *
          100,
        price_change_365d:
          yearMarketValues[yearMarketValues.length - 1] - yearMarketValues[0],
        price_change_percentage_1y:
          ((yearMarketValues[yearMarketValues.length - 1] -
            yearMarketValues[0]) /
            yearMarketValues[0]) *
          100,
      });

      setMarketChart({
        day: coinInfo[1].Data.Data.map((data) => [data.time, data.close]),
        week: coinInfo[2].Data.Data.map((data) => [data.time, data.close]),
        month: coinInfo[3].Data.Data.map((data) => [data.time, data.close]),
        year: coinInfo[4].Data.Data.map((data) => [data.time, data.close]),
      });

      setMarketValues({
        dayMarketValues,
        weekMarketValues,
        monthMarketValues,
        yearMarketValues,
      });

      setChartData({
        labels: coinInfo[1].Data.Data.map((data) =>
          new Date(data.time * 1000).toLocaleTimeString(),
        ),
        datasets: [
          {
            label: `${
              assetData.FROMSYMBOL
            } Price (Past day) in ${currentCurrency.toUpperCase()}`,
            data: dayMarketValues,
            type: "line",
            pointRadius: 1.3,
            borderColor: "#ff9500",
          },
        ],
      });
    };

    setNewCurrency();
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
            {/* <div className={styles.info_row}>
              <h3>24h Price Change:</h3>
              {+coin?.price_change_1d > 0 ? (
                <p className={styles.current}>
                  {+coin?.price_change_1d < 1 &&
                    `$${coin?.price_change_1d}`}
                  {+coin?.price_change_1d > 1 &&
                    `$${coin?.price_change_1d.toFixed(2)}`}
                </p>
              ) : (
                <p className={styles.current}>
                  {+coin?.price_change_1d < -1 &&
                    `${coin?.price_change_1d.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      },
                    )}`}
                  {+coin?.price_change_1d > -1 &&
                    `-$${Math.abs(coin?.price_change_1d).toFixed(
                      8,
                    )}`}
                </p>
              )}
            </div> */}
            <div className={styles.info_row}>
              <h3>Market Cap:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {bigNumberFormatter(coin.market_cap)}
              </p>
            </div>
            {/* <div className={styles.info_row}>
              <h3>Total Volume:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {!isBreakpoint1040
                  ? coin?.total_volume.toLocaleString("en-US", {
                      maximumFractionDigits: 8,
                    })
                  : bigNumberFormatter(coin?.total_volume)}
                {}
              </p>
            </div> */}
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
                    `${coin?.price_change_1d.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}`}
                  {+coin?.price_change_1d > -1 &&
                    `-${currentSymbol}${Math.abs(coin?.price_change_1d).toFixed(
                      8,
                    )}`}
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

  // Prepare all the fetch requests
  const cryptoCompareInfoRequest = fetch(
    `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${id.toUpperCase()}&tsyms=CAD,USD,AUD,GBP`,
    cryptoCompareFetchOptions,
  );

  const historical365DataRequest = fetch(
    `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${id}&tsym=${currency}&limit=365`,
    cryptoCompareFetchOptions,
  );

  const cryptoCompareAssetInfoRequest = fetch(
    `https://data-api.cryptocompare.com/asset/v1/data/by/symbol?asset_symbol=${id.toUpperCase()}`,
    cryptoCompareFetchOptions,
  );

  const coinPaprikaSearchRequest = fetch(
    `https://api.coinpaprika.com/v1/search?q=${id}`,
  );

  // Execute all requests concurrently
  const [
    cryptoCompareData,
    historical365Data,
    cryptoCompareAssetData,
    searchData,
  ] = await Promise.all([
    cryptoCompareInfoRequest.then((res) => res.json()),
    historical365DataRequest.then((res) => res.json()),
    cryptoCompareAssetInfoRequest.then((res) => res.json()),
    coinPaprikaSearchRequest.then((res) => res.json()),
  ]);

  // Extract rates
  const rates = {
    USD: 1,
    CAD: cryptoCompareData.RAW[id.toUpperCase()].CAD.PRICE,
    AUD: cryptoCompareData.RAW[id.toUpperCase()].AUD.PRICE,
    GBP: cryptoCompareData.RAW[id.toUpperCase()].GBP.PRICE,
  };

  // Extract necessary data points
  const data365 = historical365Data.Data.Data;
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
  if (!searchData.currencies || searchData.currencies.length === 0) {
    throw new Error("Coin not found on Coinpaprika");
  }

  // Fetch coin details including ATH from Coinpaprika
  const coinPaprikaId = searchData.currencies[0].id;
  const coinPaprikaCoinDetailsResponse = await fetch(
    `https://api.coinpaprika.com/v1/tickers/${coinPaprikaId}`,
  );
  const coinPaprikaCoinDetails = await coinPaprikaCoinDetailsResponse.json();

  // Extract the ATH from Coinpaprika's response
  const cadAthPrice = coinPaprikaCoinDetails.quotes.USD.ath_price * rates.CAD;

  const coinData = cryptoCompareData.RAW[id.toUpperCase()].CAD;
  const assetData = cryptoCompareAssetData.Data;

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
      pageId: id,
      coinData,
      assetData,
      rates,
    },
  };
}
