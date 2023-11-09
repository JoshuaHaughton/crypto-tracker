import HistoryChart from "../../components/UI/HistoryChart";
import styles from "./CoinDetails.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { bigNumberFormatter, removeHTML } from "../../utils/global.utils";
import useChartData from "../../hooks/ui/useChartData";
import { usePopularCoinsListPreloader } from "../../hooks/preloaders/usePopularCoinsListPreloader";

const CoinDetails = () => {
  const coinDetails = useSelector((state) => state.coins.selectedCoinDetails);
  const coinAttributes = coinDetails.coinAttributes;
  const currentSymbol = useSelector((state) => state.currency.symbol);

  const { chartData, currentChartPeriod, setCurrentChartPeriod } =
    useChartData(coinDetails);
  const { handleMouseEnter, handleLinkClick } = usePopularCoinsListPreloader();

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.coin_info}>
          <FontAwesomeIcon
            icon={faArrowLeft}
            className={styles.back_link}
            onMouseEnter={handleMouseEnter}
            onClick={handleLinkClick}
          />
          <header className={styles.header}>
            <div className={styles.title_wrapper}>
              <Image
                src={coinAttributes.image}
                alt={coinAttributes.name}
                width={88}
                height={88}
                className={styles.image}
              />

              <h1 className={styles.name}>{coinAttributes.name}</h1>
              <h4 className={styles.symbol}>
                {coinAttributes.symbol.toUpperCase()}
              </h4>
            </div>
            <div className={styles.description}>
              <p>
                {coinAttributes.description.split(".").length > 2
                  ? `${removeHTML(coinAttributes.description)
                      .split(".")
                      .slice(0, 2)
                      .join(". ")}.`
                  : `${removeHTML(coinAttributes.description).slice(
                      0,
                      170,
                    )}...`}
              </p>
            </div>
          </header>

          <div className={styles.info_card}>
            <div className={styles.info_row}>
              <h3>Current Price:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {coinAttributes.current_price.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                })}
              </p>
            </div>

            <div className={styles.info_row}>
              <h3>Market Cap:</h3>
              <p className={styles.current}>
                {currentSymbol}
                {bigNumberFormatter(coinAttributes.market_cap)}
              </p>
            </div>

            <div className={styles.info_row}>
              <h3>24h Price Change:</h3>
              {+coinAttributes?.price_change_1d > 0 ? (
                <p className={styles.current}>
                  {+coinAttributes?.price_change_1d < 1 &&
                    `${currentSymbol}${coinAttributes?.price_change_1d}`}
                  {+coinAttributes?.price_change_1d > 1 &&
                    `${currentSymbol}${coinAttributes?.price_change_1d.toFixed(
                      2,
                    )}`}
                </p>
              ) : (
                <p className={styles.current}>
                  {+coinAttributes?.price_change_1d < -1 &&
                    `${currentSymbol}${coinAttributes?.price_change_1d.toLocaleString()}`}
                  {+coinAttributes?.price_change_1d > -1 &&
                    `- ${currentSymbol}${Math.abs(
                      coinAttributes?.price_change_1d,
                    ).toFixed(8)}`}
                </p>
              )}
            </div>
          </div>
        </div>

        <hr />

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
            {currentChartPeriod === "day" ? (
              <button
                className={styles.selected_button}
                onClick={() => setCurrentChartPeriod("day")}
              >
                Day
              </button>
            ) : (
              <button onClick={() => setCurrentChartPeriod("day")}>Day</button>
            )}

            {currentChartPeriod === "week" ? (
              <button
                className={styles.selected_button}
                onClick={() => setCurrentChartPeriod("week")}
              >
                Week
              </button>
            ) : (
              <button onClick={() => setCurrentChartPeriod("week")}>
                Week
              </button>
            )}

            {currentChartPeriod === "month" ? (
              <button
                className={styles.selected_button}
                onClick={() => setCurrentChartPeriod("month")}
              >
                Month
              </button>
            ) : (
              <button onClick={() => setCurrentChartPeriod("month")}>
                Month
              </button>
            )}

            {currentChartPeriod === "year" ? (
              <button
                className={styles.selected_button}
                onClick={() => setCurrentChartPeriod("year")}
              >
                Year
              </button>
            ) : (
              <button onClick={() => setCurrentChartPeriod("year")}>
                Year
              </button>
            )}
          </div>

          <div className={styles.percentage_details}>
            {/* <h3>Percentage Changes</h3> */}
            <div className={styles.cards_wrapper}>
              {currentChartPeriod === "day" ? (
                <div className={styles.selected_card}>
                  <div className={styles.card_description}>
                    <p>Day Gain/Loss</p>
                    {/* <p>Past Day %:</p> */}
                    {coinAttributes?.price_change_percentage_24h >= 0 ? (
                      <h3 className={styles.green}>
                        +
                        {coinAttributes?.price_change_percentage_24h.toFixed(3)}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coinAttributes?.price_change_percentage_24h.toFixed(3)}
                        %
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
                        +
                        {coinAttributes?.price_change_percentage_24h.toFixed(3)}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coinAttributes?.price_change_percentage_24h.toFixed(3)}
                        %
                      </h3>
                    )}
                  </div>
                </div>
              )}

              {currentChartPeriod === "week" ? (
                <div className={styles.selected_card}>
                  <div className={styles.card_description}>
                    <p>Week Gain/Loss</p>
                    {/* <h3></h3> */}
                    {coinAttributes?.price_change_percentage_7d >= 0 ? (
                      <h3 className={styles.green}>
                        +{coinAttributes?.price_change_percentage_7d.toFixed(3)}
                        %
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
                        +{coinAttributes?.price_change_percentage_7d.toFixed(3)}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coinAttributes?.price_change_percentage_7d.toFixed(3)}%
                      </h3>
                    )}
                  </div>
                </div>
              )}

              {currentChartPeriod === "month" ? (
                <div className={styles.selected_card}>
                  <div className={styles.card_description}>
                    <p>Month Gain/Loss:</p>
                    {coinAttributes?.price_change_percentage_30d >= 0 ? (
                      <h3 className={styles.green}>
                        +
                        {coinAttributes?.price_change_percentage_30d.toFixed(3)}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coinAttributes?.price_change_percentage_30d.toFixed(3)}
                        %
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
                        +
                        {coinAttributes?.price_change_percentage_30d.toFixed(3)}
                        %
                      </h3>
                    ) : (
                      <h3 className={styles.red}>
                        {coinAttributes?.price_change_percentage_30d.toFixed(3)}
                        %
                      </h3>
                    )}
                  </div>
                </div>
              )}

              {currentChartPeriod === "year" ? (
                <div className={styles.selected_card}>
                  <div className={styles.card_description}>
                    {/* <p>Past Year:</p> */}
                    <p>Year Gain/Loss</p>
                    {/* <h3></h3> */}
                    {coinAttributes?.price_change_percentage_1y >= 0 ? (
                      <h3 className={styles.green}>
                        +{coinAttributes?.price_change_percentage_1y.toFixed(3)}
                        %
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
                        +{coinAttributes?.price_change_percentage_1y.toFixed(3)}
                        %
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
      </div>
    </div>
  );
};

export default CoinDetails;
