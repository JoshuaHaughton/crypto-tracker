import React, { useRef } from 'react'
import { Line, Bar  } from 'react-chartjs-2'
import { Chart as ChartJS } from "chart.js"
let myLineChart;
const HistoryChart = ({ chartData }) => {
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

  

  const chartData2 = { 
    ...chartData, 
    labels: [...chartData.labels],
    datasets: [
      {
        ...chartData.datasets,
     

      }
    ]
      

    } 

console.log(chartData2);

  return (
    <Line data={chartData} pointRadius={20}
    pointStyle={'circle'} options={{
      scales: {
        xAxis: {
                ticks: {
                  maxTicksLimit: 20
                }
                }
        },
    }
    } />

  )
}

export default HistoryChart