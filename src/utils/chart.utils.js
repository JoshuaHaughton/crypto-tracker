/**
 * Updates and returns chart data based on provided values.
 *
 * @param {Object} coin - Coin details.
 * @param {string} currentCurrency - Current currency.
 * @param {Array} labels - Array of date labels.
 * @param {Array} dataValues - Array of market values.
 * @param {string} periodLabel - Label indicating the period (e.g., "Past day", "Past week").
 * @returns {Object} Updated chart data.
 */
export const updateChartData = (
  coin,
  currentCurrency,
  labels,
  dataValues,
  periodLabel,
) => {
  return {
    labels: labels,
    datasets: [
      {
        label: `${
          coin.name
        } Price (${periodLabel}) in ${currentCurrency.toUpperCase()}`,
        data: dataValues,
        type: "line",
        pointRadius: 1.3,
        borderColor: "#ff9500",
      },
    ],
  };
};
