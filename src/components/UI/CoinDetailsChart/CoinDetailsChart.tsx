import styles from "./CoinDetailsChart.module.scss";
import useChartData from "@/components/UI/CoinDetailsChart/useChartData";
import HistoryChart from "../HistoryChart/HistoryChart";
import { EChartPeriodInterval, ICoinDetails } from "@/lib/types/coinTypes";
import { isFullCoinDetails } from "@/lib/utils/global.utils";
import CoinDetailsChartSkeleton from "../Skeletons/CoinDetailsChart/CoinDetailsChartSkeleton";

/**
 * Props for the CoinDetailsChart component.
 */
export interface ICoinDetailsChartProps {
  coinDetails: ICoinDetails | undefined;
}

/**
 * Renders the chart for displaying coin details.
 * Utilizes the `useChartData` hook for fetching and managing chart data.
 *
 * @param {ICoinDetailsChartProps} props - Props containing the coin details.
 * @returns {JSX.Element} - The rendered chart component.
 */
const CoinDetailsChart: React.FC<ICoinDetailsChartProps> = ({
  coinDetails,
}: ICoinDetailsChartProps): JSX.Element => {
  const { chartData, currentChartPeriod, setCurrentChartPeriod } =
    useChartData(coinDetails);
  if (coinDetails == null || !isFullCoinDetails(coinDetails)) {
    return <CoinDetailsChartSkeleton coinDetails={coinDetails} />;
  }

  const { coinAttributes } = coinDetails;

  return (
    <div className={styles.chart_wrapper}>
      <div className={styles.chart_card}>
        <HistoryChart
          chartData={chartData}
          currentChartPeriod={currentChartPeriod}
        />
      </div>

      <div className={styles.chart_actions}>
        <div className={styles.chart_action}>
          <button
            className={
              currentChartPeriod === EChartPeriodInterval.H24
                ? styles.selected_action
                : undefined
            }
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.H24)}
          >
            Day
          </button>
          <div
            className={
              currentChartPeriod === EChartPeriodInterval.H24
                ? styles.selected_card
                : undefined
            }
          >
            <div className={styles.card_description}>
              <p className={styles.card_descriptionTitle}>Day Gain/Loss</p>
              {/* <p>Past Day %:</p> */}
              {coinAttributes?.price_change_percentage_24h >= 0 ? (
                <p className={styles.green}>
                  +{coinAttributes?.price_change_percentage_24h.toFixed(3)}%
                </p>
              ) : (
                <p className={styles.red}>
                  {coinAttributes?.price_change_percentage_24h.toFixed(3)}%
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.chart_action}>
          <button
            className={
              currentChartPeriod === EChartPeriodInterval.WEEK
                ? styles.selected_action
                : undefined
            }
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.WEEK)}
          >
            Week
          </button>
          <div
            className={
              currentChartPeriod === EChartPeriodInterval.WEEK
                ? styles.selected_card
                : undefined
            }
          >
            <div className={styles.card_description}>
              <p className={styles.card_descriptionTitle}>Week Gain/Loss</p>
              {/* <p></p> */}
              {coinAttributes?.price_change_percentage_7d >= 0 ? (
                <p className={styles.green}>
                  +{coinAttributes?.price_change_percentage_7d.toFixed(3)}%
                </p>
              ) : (
                <p className={styles.red}>
                  {coinAttributes?.price_change_percentage_7d.toFixed(3)}%
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.chart_action}>
          <button
            className={
              currentChartPeriod === EChartPeriodInterval.MONTH
                ? styles.selected_action
                : undefined
            }
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.MONTH)}
          >
            Month
          </button>

          <div
            className={
              currentChartPeriod === EChartPeriodInterval.MONTH
                ? styles.selected_card
                : undefined
            }
          >
            <div className={styles.card_description}>
              <p className={styles.card_descriptionTitle}>Month Gain/Loss:</p>
              {coinAttributes?.price_change_percentage_30d >= 0 ? (
                <p className={styles.green}>
                  +{coinAttributes?.price_change_percentage_30d.toFixed(3)}%
                </p>
              ) : (
                <p className={styles.red}>
                  {coinAttributes?.price_change_percentage_30d.toFixed(3)}%
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.chart_action}>
          <button
            className={
              currentChartPeriod === EChartPeriodInterval.YEAR
                ? styles.selected_action
                : undefined
            }
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.YEAR)}
          >
            Year
          </button>
          <div
            className={
              currentChartPeriod === EChartPeriodInterval.YEAR
                ? styles.selected_card
                : undefined
            }
          >
            <div className={styles.card_description}>
              {/* <p>Past Year:</p> */}
              <p className={styles.card_descriptionTitle}>Year Gain/Loss</p>
              {/* <p></p> */}
              {coinAttributes?.price_change_percentage_1y >= 0 ? (
                <p className={styles.green}>
                  +{coinAttributes?.price_change_percentage_1y.toFixed(3)}%
                </p>
              ) : (
                <p className={styles.red}>
                  {coinAttributes?.price_change_percentage_1y.toFixed(3)}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetailsChart;
