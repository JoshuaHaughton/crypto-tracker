import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Chart from "chart.js/auto";
import { useSelector } from "react-redux";
// import faker from "faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Chart.js Line Chart",
    },
  },
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];

export const data = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: labels.map(() => Math.random() * 1000),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: labels.map(() => Math.random() * 1000),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

const HistoryChart = ({ chartData, currentChartPeriod }) => {
  let maxTicks = 20;
  const isBreakpoint520 = useSelector(
    (state) => state.mediaQuery.isBreakpoint520,
  );
  console.log(chartData);
  console.log(currentChartPeriod);
  if (!isBreakpoint520) {
    switch (currentChartPeriod) {
      case "day":
        maxTicks = 25;
        break;

      case "week":
        maxTicks = 7;
        break;

      case "month":
        maxTicks = 31;
        break;

      case "year":
        maxTicks = 12;
        break;
    }
  } else {
    maxTicks = 5;
  }

  return (
    <Line options={options} data={chartData} />
    // <Line
    //   data={chartData}
    //   options={{
    //     scales: {
    //       xAxis: {
    //         ticks: {
    //           maxTicksLimit: maxTicks,
    //         },
    //         grid: {
    //           color: "rgba(75,75,76, 0.4)",
    //         },
    //       },
    //       yAxis: {
    //         grid: {
    //           color: "rgb(75,75,76, 0.4)",
    //         },
    //       },
    //     },
    //   }}
    // />
  );
};

export default HistoryChart;
