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
        <div className={styles.chart}>
          <HistoryChart
            chartData={chartData}
            currentChartPeriod={currentChartPeriod}
          />
        </div>
      </div>
      <div className={styles.chart_buttons}>
        {currentChartPeriod === EChartPeriodInterval.H24 ? (
          <button
            className={styles.selected_button}
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.H24)}
          >
            Day
          </button>
        ) : (
          <button
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.H24)}
          >
            Day
          </button>
        )}

        {currentChartPeriod === EChartPeriodInterval.WEEK ? (
          <button
            className={styles.selected_button}
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.WEEK)}
          >
            Week
          </button>
        ) : (
          <button
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.WEEK)}
          >
            Week
          </button>
        )}

        {currentChartPeriod === EChartPeriodInterval.MONTH ? (
          <button
            className={styles.selected_button}
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.MONTH)}
          >
            Month
          </button>
        ) : (
          <button
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.MONTH)}
          >
            Month
          </button>
        )}

        {currentChartPeriod === EChartPeriodInterval.YEAR ? (
          <button
            className={styles.selected_button}
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.YEAR)}
          >
            Year
          </button>
        ) : (
          <button
            onClick={() => setCurrentChartPeriod(EChartPeriodInterval.YEAR)}
          >
            Year
          </button>
        )}
      </div>

      <div className={styles.percentage_details}>
        {/* <h3>Percentage Changes</h3> */}
        <div className={styles.cards_wrapper}>
          {currentChartPeriod === EChartPeriodInterval.H24 ? (
            <div className={styles.selected_card}>
              <div className={styles.card_description}>
                <p>Day Gain/Loss</p>
                {/* <p>Past Day %:</p> */}
                {coinAttributes?.price_change_percentage_24h >= 0 ? (
                  <h3 className={styles.green}>
                    +{coinAttributes?.price_change_percentage_24h.toFixed(3)}%
                  </h3>
                ) : (
                  <h3 className={styles.red}>
                    {coinAttributes?.price_change_percentage_24h.toFixed(3)}%
                  </h3>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.card_description}>
                <p>Day Gain/Loss</p>
                {/* <p>Past Day %:</p> */}
                {coinAttributes?.price_change_percentage_24h >= 0 ? (
                  <h3 className={styles.green}>
                    +{coinAttributes?.price_change_percentage_24h.toFixed(3)}%
                  </h3>
                ) : (
                  <h3 className={styles.red}>
                    {coinAttributes?.price_change_percentage_24h.toFixed(3)}%
                  </h3>
                )}
              </div>
            </div>
          )}

          {currentChartPeriod === EChartPeriodInterval.WEEK ? (
            <div className={styles.selected_card}>
              <div className={styles.card_description}>
                <p>Week Gain/Loss</p>
                {/* <h3></h3> */}
                {coinAttributes?.price_change_percentage_7d >= 0 ? (
                  <h3 className={styles.green}>
                    +{coinAttributes?.price_change_percentage_7d.toFixed(3)}%
                  </h3>
                ) : (
                  <h3 className={styles.red}>
                    {coinAttributes?.price_change_percentage_7d.toFixed(3)}%
                  </h3>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.card_description}>
                <p>Week Gain/Loss</p>
                {/* <h3></h3> */}
                {coinAttributes?.price_change_percentage_7d >= 0 ? (
                  <h3 className={styles.green}>
                    +{coinAttributes?.price_change_percentage_7d.toFixed(3)}%
                  </h3>
                ) : (
                  <h3 className={styles.red}>
                    {coinAttributes?.price_change_percentage_7d.toFixed(3)}%
                  </h3>
                )}
              </div>
            </div>
          )}

          {currentChartPeriod === EChartPeriodInterval.MONTH ? (
            <div className={styles.selected_card}>
              <div className={styles.card_description}>
                <p>Month Gain/Loss:</p>
                {coinAttributes?.price_change_percentage_30d >= 0 ? (
                  <h3 className={styles.green}>
                    +{coinAttributes?.price_change_percentage_30d.toFixed(3)}%
                  </h3>
                ) : (
                  <h3 className={styles.red}>
                    {coinAttributes?.price_change_percentage_30d.toFixed(3)}%
                  </h3>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.card_description}>
                <p>Month Gain/Loss:</p>
                {coinAttributes?.price_change_percentage_30d >= 0 ? (
                  <h3 className={styles.green}>
                    +{coinAttributes?.price_change_percentage_30d.toFixed(3)}%
                  </h3>
                ) : (
                  <h3 className={styles.red}>
                    {coinAttributes?.price_change_percentage_30d.toFixed(3)}%
                  </h3>
                )}
              </div>
            </div>
          )}

          {currentChartPeriod === EChartPeriodInterval.YEAR ? (
            <div className={styles.selected_card}>
              <div className={styles.card_description}>
                {/* <p>Past Year:</p> */}
                <p>Year Gain/Loss</p>
                {/* <h3></h3> */}
                {coinAttributes?.price_change_percentage_1y >= 0 ? (
                  <h3 className={styles.green}>
                    +{coinAttributes?.price_change_percentage_1y.toFixed(3)}%
                  </h3>
                ) : (
                  <h3 className={styles.red}>
                    {coinAttributes?.price_change_percentage_1y.toFixed(3)}%
                  </h3>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.card_description}>
                <p>Year Gain/Loss</p>
                {/* <h3></h3> */}
                {coinAttributes?.price_change_percentage_1y >= 0 ? (
                  <h3 className={styles.green}>
                    +{coinAttributes?.price_change_percentage_1y.toFixed(3)}%
                  </h3>
                ) : (
                  <h3 className={styles.red}>
                    {coinAttributes?.price_change_percentage_1y.toFixed(3)}%
                  </h3>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinDetailsChart;
