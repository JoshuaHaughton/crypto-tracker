import React from 'react'
import { Line, Bar  } from 'react-chartjs-2'
import { Chart as ChartJS } from "chart.js"
const HistoryChart = ({ chartData }) => {
  console.log('cd,', chartData)
  return (
    <Line data={chartData} />

  )
}

export default HistoryChart