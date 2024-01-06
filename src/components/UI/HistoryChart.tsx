import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJs } from "chart.js";
import Chart from "chart.js/auto";
import { useSelector } from "react-redux";

const HistoryChart = ({ chartData, currentChartPeriod }) => {
  let maxTicks = 20;
  const isBreakpoint520 = useSelector(
    (state) => state.mediaQuery.isBreakpoint520,
  );

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
    <Line
      data={chartData}
      options={{
        scales: {
          xAxis: {
            ticks: {
              maxTicksLimit: maxTicks,
            },
            grid: {
              color: "rgba(75,75,76, 0.4)",
            },
          },
          yAxis: {
            grid: {
              color: "rgb(75,75,76, 0.4)",
            },
          },
        },
      }}
    />
  );
};

export default HistoryChart;
