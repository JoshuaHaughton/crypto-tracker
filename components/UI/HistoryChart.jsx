import React, { useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js";

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

  const chartData2 = {
    ...chartData,
    labels: [...chartData.labels],
    datasets: [
      {
        ...chartData.datasets,
      },
    ],
  };

  console.log(chartData2);

  let maxTicks = 20;

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

  return (
    <Line
      data={chartData}
      pointRadius={30}
      pointStyle={"circle"}
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
          }
        },
      }}
    />
  );
};

export default HistoryChart;
