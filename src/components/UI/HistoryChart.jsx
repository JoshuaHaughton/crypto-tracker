import React, { useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js";
import { useMediaQuery } from "../Coin/Coin";

const HistoryChart = ({ chartData, currentChartPeriod }) => {
  // const chartRef = useRef()
  // console.log('cd,', chartData)

  // const profitChartRef = useRef();

  //   if (profitChartRef?.current) {
  //       profitChartRef.current.chartInstance.destroy();
  //   }

  // const myChartRef = chartRef.current.getContext("2d");
  // const { data, average, labels } = this.props;

  // if (typeof myLineChart !== "undefined") myLineChart.destroy();

  // myLineChart = (<Line data={chartData} />)

  // const chartData;


  let maxTicks = 20;
  const isBreakpoint520 = useMediaQuery(520)

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
    maxTicks = 5
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
              color: "rgba(75,75,76, 0.4)"
            }
          },
          yAxis: {
            grid: {
              color: "rgb(75,75,76, 0.4)"
            }
          },
        },
      }}
    />
  );
};

export default HistoryChart;
