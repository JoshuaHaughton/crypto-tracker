import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { cloneDeep } from "lodash";

/**
 * Configuration object for chart periods.
 *
 * @typedef {Object} ChartPeriod
 * @property {function(Array): Array<string>} getLabels - A function that takes in the data array and returns an array of formatted date labels.
 * @property {function(Object): Array<number>} getData - A function that retrieves the specific dataset based on the chart period.
 * @property {string} label - A human-readable label for the chart period.
 *
 * @type {Object<string, ChartPeriod>}
 *
 * @example
 *
 * chartPeriodConfig.day.getLabels(data); // Returns formatted time strings for 'day' period.
 * chartPeriodConfig.week.getData(values); // Returns week market values.
 */
const chartPeriodConfig = {
  day: {
    getLabels: (data) =>
      data.map((item) => new Date(item[0]).toLocaleTimeString()),
    getData: (values) => values.dayMarketValues,
    label: "Past day",
  },
  week: {
    getLabels: (data) =>
      data.map((item) => new Date(item[0]).toLocaleDateString()),
    getData: (values) => values.weekMarketValues,
    label: "Past week",
  },
  month: {
    getLabels: (data) =>
      data.map((item) => new Date(item[0]).toLocaleDateString()),
    getData: (values) => values.monthMarketValues,
    label: "Past month",
  },
  year: {
    getLabels: (data) =>
      data.map((item) => new Date(item[0]).toLocaleDateString()),
    getData: (values) => values.yearMarketValues,
    label: "Past year",
  },
};

/**
 * Custom hook to manage and update chart data.
 *
 * @param {Object} coinDetails - Details of the coin.
 * @returns {Object} Chart data.
 */
function useChartData(coinDetails) {
  const currentCurrency = useSelector(
    (state) => state.currency.currentCurrency,
  );
  const [chartData, setChartData] = useState(coinDetails.chartValues);
  const [currentChartPeriod, setCurrentChartPeriod] = useState("day");

  useEffect(() => {
    const { marketChartValues, marketValues } = coinDetails;
    // Chart.js mutates these values which causes an error
    const clonedMarketValues = cloneDeep(marketValues);
    const config = chartPeriodConfig[currentChartPeriod];
    const labels = config.getLabels(marketChartValues[currentChartPeriod]);
    const dataValues = config.getData(clonedMarketValues);

    setChartData({
      labels: labels,
      datasets: [
        {
          label: `${coinDetails.coinInfo.name} Price (${
            config.label
          }) in ${currentCurrency.toUpperCase()}`,
          data: dataValues,
          type: "line",
          pointRadius: 1.3,
          borderColor: "#ff9500",
        },
      ],
    });
  }, [coinDetails, currentCurrency, currentChartPeriod]);

  return { chartData, currentChartPeriod, setCurrentChartPeriod };
}

export default useChartData;
