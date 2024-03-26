import React from "react";
import styles from "./PopularCoinsList.module.scss";
import PopularCoinsListItem from "./PopularCoinsListItem/PopularCoinsListItem";
import Pagination from "../Pagination/Pagination";
import { TextField } from "@mui/material";
import { formatBigNumber } from "@/lib/utils/global.utils";
import {
  POPULAR_COINS_PAGE_SIZE,
  TCurrencySymbol,
} from "@/lib/constants/globalConstants";
import {
  TEXT_FIELD_SX,
  usePopularCoinsList,
} from "@/components/UI/PopularCoinsList/usePopularCoinsList";
import {
  IDisplayedCoinOverview,
  IPopularCoinSearchItem,
} from "@/lib/types/coinTypes";
import { isNumber } from "../../../lib/utils/global.utils";
import MobileNavigationArrows from "../Pagination/MobileNavigationArrows/MobileNavigationArrows";

/**
 * Displays a list of popular coins with pagination and search functionality.
 * Handles different loading states to provide feedback to the user.
 * @returns The PopularCoinsList component as a React Functional Component.
 */
const PopularCoinsList: React.FC = () => {
  // Destructuring values from the custom hook for managing state and behavior of the popular coins list.
  const {
    searchQuery,
    coinsForCurrentPage,
    totalItemsCount,
    currentPageNumber,
    isPreviousDisabled,
    isNextDisabled,
    paginationRange,
    currentSymbol,
    handleInputChange,
    handleItemMouseEnter,
    handleNavigation,
    goToPreviousPage,
    goToNextPage,
    goToPage,
  } = usePopularCoinsList();

  // Determine which content to display based on the loading state and coinsForCurrentPage length
  let contentToDisplay =
    totalItemsCount > 0
      ? mapCoinsToComponents(
          coinsForCurrentPage,
          currentPageNumber,
          currentSymbol,
          handleItemMouseEnter,
          handleNavigation,
        )
      : renderEmptyState();

  console.log("coinsForCurrentPage - PopularCoinsList", coinsForCurrentPage);

  return (
    <>
      <div className={styles.list}>
        <div className={styles.listHead}>
          <h2 className={styles.listTitle}>Crypto Prices</h2>
          <div className={styles.listActions}>
            <TextField
              label="Search for a cryptocurrency"
              variant="outlined"
              sx={TEXT_FIELD_SX}
              value={searchQuery}
              className={styles.listSearch}
              onChange={handleInputChange}
            />
            <MobileNavigationArrows
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
              isPreviousDisabled={isPreviousDisabled}
              isNextDisabled={isNextDisabled}
            />
          </div>
        </div>
        <div className={styles.listBody} id="market">
          <table className={styles.listTable}>
            <thead className={styles.listTableHead}>
              <tr>
                <th className={styles.listTableHeadCellCoin}>Coin</th>
                <th className={styles.listTableHeadCellPrice}>Price</th>
                <th className={styles.listTableHeadCellVolume}>24hr Volume</th>
                <th className={styles.listTableHeadCellChange}>24hr Change</th>
                <th className={styles.listTableHeadCellMarket_Cap}>
                  Market Cap
                </th>
              </tr>
            </thead>
            <tbody>{contentToDisplay}</tbody>
          </table>
        </div>
        <Pagination
          paginationRange={paginationRange}
          currentPageNumber={currentPageNumber}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          goToPage={goToPage}
        />
      </div>
    </>
  );
};

export default PopularCoinsList;

function renderEmptyState() {
  return (
    <tr>
      <td colSpan={5} className={styles.emptyState}>
        No coins found.
      </td>
    </tr>
  );
}

/**
 * Maps an array of coin data to PopularCoinsListItem components.
 * This function preprocesses coin data to fit the display requirements of the PopularCoinsListItem components.
 * It handles the conditional formatting of numerical values based on the screen size and
 * enriches the coin data with additional display-specific properties such as market cap rank.
 *
 * @param {IPopularCoinSearchItem[]} coinsForCurrentPage - Array of coins for the current page.
 * @param {boolean} isDesktop - True if the current screen width is above 1250 pixels.
 * @param {number} currentPageNumber - Current page number in pagination.
 * @param {TCurrencySymbol} currentSymbol - The current currency symbol used for price display.
 * @returns {JSX.Element[]} An array of PopularCoinsListItem components populated with formatted coin data.
 */
function mapCoinsToComponents(
  coinsForCurrentPage: IPopularCoinSearchItem[],
  currentPageNumber: number,
  currentSymbol: TCurrencySymbol,
  handleItemMouseEnter: (id: string) => void,
  handleNavigation: (id: string) => void,
): JSX.Element[] {
  return coinsForCurrentPage.map((listItem, index): JSX.Element => {
    const { coinDetails: coin, matchDetails } = listItem;

    // Define and format necessary properties from the coin data
    const marketCapRank =
      (currentPageNumber - 1) * POPULAR_COINS_PAGE_SIZE + index + 1;

    const formattedCurrentPrice = formatCoinsListNumber(
      coin.current_price,
      false,
    );
    const formattedVolume = formatCoinsListNumber(coin.volume_24h, false);
    const formattedTotalMarketCap = formatCoinsListNumber(
      coin.total_market_cap,
      false,
    );
    const formattedPriceChangePercentage = `${coin.price_change_percentage_24h.toFixed(
      2,
    )}%`;

    // Constructing enhancedCoin object with additional and formatted properties
    const enhancedCoin: IDisplayedCoinOverview = {
      ...coin,
      currentCurrencySymbol: currentSymbol,
      market_cap_rank: marketCapRank,
      current_price: formattedCurrentPrice,
      volume_24h: formattedVolume,
      total_market_cap: formattedTotalMarketCap,
      price_change_percentage_24h: formattedPriceChangePercentage,
    };

    return (
      <PopularCoinsListItem
        key={coin.symbol}
        coin={enhancedCoin}
        matchDetails={matchDetails}
        handleMouseEnter={() => handleItemMouseEnter(coin.symbol)}
        handleClick={() => handleNavigation(coin.symbol)}
      />
    );
  });
}

/**
 * Formats numeric values for display in the PopularCoinsList.
 * If the value fails the number check, returns a default message.
 * Otherwise, formats the number based on a threshold condition.
 *
 * @param value - The numeric value to format.
 * @param isPassedThreshold - Boolean indicating whether the formatting threshold has been passed.
 * @returns The formatted string or a message indicating missing information.
 */
function formatCoinsListNumber(value: number, isPassedThreshold: boolean) {
  // Check if value is a number; return a default message if not
  if (!isNumber(value)) return "API Info Missing";

  // Format the number based on whether the threshold condition is met
  return isPassedThreshold
    ? formatBigNumber(value)
    : value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}
