import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { cloneDeep } from "lodash";
import {
  EChartPeriodInterval,
  ICoinDetails,
  IPriceChartDataset,
  IPriceTrendData,
} from "@/types/coinTypes";
import { selectCurrentCurrency } from "@/lib/store/currency/currencySelectors";
import { isFullCoinDetails } from "@/utils/global.utils";

/**
 * Defines the structure for a single chart period.
 * Includes functions to extract labels and data from the given dataset,
 * and a human-readable label for the chart period.
 *
 * @property {Function} getLabels - Function to generate labels for the chart from the dataset.
 * @property {Function} getData - Function to extract the relevant data for the chart from the dataset.
 * @property {string} label - Human-readable label for the chart period.
 */
interface IChartPeriod {
  getLabels: (data: Array<[number, number]>) => string[];
  getData: (values: IPriceTrendData) => number[];
  label: string;
}

/**
 * Represents the configuration for different chart periods (e.g., 24h, week, month, year).
 * Each chart period contains functions to get labels and data specific to that period,
 * and a label for display purposes.
 */
type TChartPeriodConfig = {
  [key in EChartPeriodInterval]: IChartPeriod;
};

const chartPeriodConfig: TChartPeriodConfig = {
  h24: {
    getLabels: (data) =>
      data?.map((item) => new Date(item[0]).toLocaleTimeString()),
    getData: (values) => values?.h24MarketValues,
    label: "Past 24 hours",
  },
  week: {
    getLabels: (data) =>
      data?.map((item) => new Date(item[0]).toLocaleDateString()),
    getData: (values) => values?.weekMarketValues,
    label: "Past week",
  },
  month: {
    getLabels: (data) =>
      data?.map((item) => new Date(item[0]).toLocaleDateString()),
    getData: (values) => values?.monthMarketValues,
    label: "Past month",
  },
  year: {
    getLabels: (data) =>
      data?.map((item) => new Date(item[0]).toLocaleDateString()),
    getData: (values) => values?.yearMarketValues,
    label: "Past year",
  },
};

/**
 * Type definition for the return value of useChartData hook.
 */
interface IChartDataState {
  chartData: IPriceChartDataset | null;
  currentChartPeriod: EChartPeriodInterval;
  setCurrentChartPeriod: React.Dispatch<
    React.SetStateAction<EChartPeriodInterval>
  >;
}

/**
 * Custom hook to manage and update chart data.
 *
 * @param {ICoinDetails | null} coinDetails - Details of the coin, or null if not loaded.
 * @returns {IChartDataState} Chart data and related state.
 */
function useChartData(coinDetails: ICoinDetails | null): IChartDataState {
  // Retrieve the current currency from the Redux store
  const currentCurrency = useSelector(selectCurrentCurrency);

  // State to manage the current chart period
  const [currentChartPeriod, setCurrentChartPeriod] =
    useState<EChartPeriodInterval>(EChartPeriodInterval.H24);

  // Memoize the chart period configuration to avoid unnecessary recalculations
  const currentChartConfig = useMemo(
    () => chartPeriodConfig[currentChartPeriod],
    [currentChartPeriod],
  );

  // Memoize the labels and dataValues for the chart
  const { labels, dataValues } = useMemo(() => {
    // Return empty arrays if coinDetails are not fully loaded or are null
    if (!coinDetails || !isFullCoinDetails(coinDetails)) {
      return { labels: [], dataValues: [] };
    }

    // Clone market values to avoid mutation by Chart.js
    const clonedMarketValues = cloneDeep(coinDetails.priceTrendData);

    // Generate labels and data for the chart based on the current chart period
    const generatedLabels = currentChartConfig.getLabels(
      coinDetails.timeSeriesPriceData[currentChartPeriod],
    );
    const generatedDataValues = currentChartConfig.getData(clonedMarketValues);

    return { labels: generatedLabels, dataValues: generatedDataValues };
  }, [coinDetails, currentChartConfig, currentChartPeriod]);

  // Create chart data object, memoized to avoid unnecessary recalculations
  const chartData = useMemo(() => {
    // Return null if labels or dataValues are empty
    if (labels.length === 0 || dataValues.length === 0) return null;

    return {
      labels: labels,
      datasets: [
        {
          label: `${coinDetails?.coinAttributes?.name} Price (${
            currentChartConfig.label
          }) in ${currentCurrency.toUpperCase()}`,
          data: dataValues,
          type: "line",
          pointRadius: 1.3,
          borderColor: "#ff9500",
        },
      ],
    };
  }, [labels, dataValues, coinDetails, currentChartConfig, currentCurrency]);

  return { chartData, currentChartPeriod, setCurrentChartPeriod };
}

export default useChartData;
