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
        label: "Price (Past 1 day) in CAD",
        data: market_values.oneDayMarketValues,
        backgroundColor: ["red"],
        fill: "origin",
        pointRadius: 0,
      },
    ],
  });

  console.log(coin);
  console.log("resultsDay etc.", chartData.day);

  const dayClickHandler = () => {
    
    setChartData(prev => {
      return {labels: market_chart.day.map((data) =>
        new Date(data[0]).toLocaleTimeString(),
      ), datasets: [ {
        label: "Price (Past 1 day) in CAD",
        data: market_values.oneDayMarketValues,
        backgroundColor: ["red"],
        fill: "origin",
        pointRadius: 0,
      }] }
    })
  }

  const monthClickHandler = () => {
    
    setChartData(prev => {
      return {labels: market_chart.month.map((data) =>
        new Date(data[0]).toLocaleDateString(),
      ), datasets: [ {
        label: "Price (Past 1 month) in CAD",
        data: market_values.oneMonthMarketValues,
        backgroundColor: ["red"],
        fill: "origin",
        pointRadius: 0,
      }] }
    })
  }

  const threeMonthClickHandler = () => {
    
    setChartData(prev => {
      console.log(market_chart);
      return {labels: market_chart.threeMonth.map((data) =>
        new Date(data[0]).toLocaleDateString(),
      ), datasets: [ {
        label: "Price (Past 3 months) in CAD",
        data: market_values.threeMonthMarketValues,
        backgroundColor: ["red"],
        fill: "origin",
        pointRadius: 0,
      }] }
    })
  }

  const yearClickHandler = () => {
    
    setChartData(prev => {
      return {labels: market_chart.year.map((data) =>
        new Date(data[0]).toLocaleDateString(),
      ), datasets: [ {
        label: "Price (Past 1 year) in CAD",
        data: market_values.oneYearMarketValues,
        backgroundColor: ["red"],
        fill: "origin",
        pointRadius: 0,
      }] }
    })
  }


  return (
    <div className={styles.container}>
      <div className={styles.coin_info}>

        <header className={styles.header}>
          <div className={styles.title_wrapper}>
            <Image
              src={coin.image.large}
              alt={coin.name}
              width={50}
              height={50}
              className={styles.image}
            />
            <h1 className={styles.name}>{coin.name}</h1>
          </div>

          {/* <div className={styles.description}>{coin.description.en}</div> */}

        </header>

        <div className={styles.info_card}>
          <h3>Current Price</h3>
          <p className={styles.current}>
            ${coin.market_data.current_price.cad}
          </p>
        </div>
        {/* <p className={styles.symbol}>{coin.symbol.toUpperCase()}</p> */}
      </div>

      <div className={styles.chart_wrapper}>
        <HistoryChart chartData={chartData} />
        <div className={styles.chart_buttons}>
          <button onClick={dayClickHandler}>24 Hours</button>
          <button onClick={monthClickHandler}>30 Days</button>
          <button onClick={threeMonthClickHandler}>3 Months</button>
          <button onClick={yearClickHandler}>1 Year</button>
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
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=30`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=90`,
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=cad&days=365`,
  ];

  const coinInfo = await Promise.all(
    urls.map((url) => fetch(url).then((resp) => resp.json())),
  ).then((res) => {
    // console.log('yup', res)
    return res;
  });



  const oneDayMarketValues = coinInfo[1].prices.map((data) => data[1]);
  const oneMonthMarketValues = coinInfo[2].prices.map((data) => data[1]);
  const threeMonthMarketValues = coinInfo[3].prices.map((data) => data[1]);
  const oneYearMarketValues = coinInfo[4].prices.map((data) => data[1]);

  return {
    props: {
      coin: coinInfo[0],
      market_chart: {
        day: coinInfo[1].prices,
        month: coinInfo[2].prices,
        threeMonth: coinInfo[3].prices,
        year: coinInfo[4].prices,
      },
      market_values: {
        oneDayMarketValues, oneMonthMarketValues, threeMonthMarketValues, oneYearMarketValues
      },
    },
  };
}
