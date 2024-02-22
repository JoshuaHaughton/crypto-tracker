import React from "react";
import styles from "./PopularCoinsList.module.scss";
import PopularCoinsListItem from "./PopularCoinsListItem/PopularCoinsListItem";
import PopularCoinsListSkeleton from "../Skeletons/PopularCoinsListSkeleton/PopularCoinsListSkeleton";
import Pagination from "../Pagination/Pagination";
import { TextField } from "@mui/material";
import { formatBigNumber } from "@/lib/utils/dataFormat.utils";
import {
  POPULAR_COINS_PAGE_SIZE,
  TCurrencySymbol,
} from "@/lib/constants/globalConstants";
import { usePopularCoinsList } from "@/components/UI/PopularCoinsList/usePopularCoinsList";
import {
  IDisplayedCoinOverview,
  IPopularCoinSearchItem,
} from "@/lib/types/coinTypes";

/**
 * Displays a list of popular coins with pagination and search functionality.
 * Handles different loading states to provide feedback to the user.
 * @returns The PopularCoinsList component as a React Functional Component.
 */
const PopularCoinsList: React.FC = () => {
  // Destructuring values from the custom hook for managing state and behavior of the popular coins list.
  const {
    search,
    coinsForCurrentPage,
    popularCoinsAreLoading,
    popularCoinsListPageNumber,
    currentSymbol,
    isBreakpoint1250,
    handleInputChange,
    handleItemMouseEnter,
    handleItemClick,
  } = usePopularCoinsList();

  // Determine which content to display based on the loading state and coinsForCurrentPage length
  let contentToDisplay;
  if (popularCoinsAreLoading) {
    contentToDisplay = <PopularCoinsListSkeleton />;
  } else {
    contentToDisplay =
      coinsForCurrentPage.length > 0
        ? mapCoinsToComponents(
            coinsForCurrentPage,
            isBreakpoint1250,
            popularCoinsListPageNumber,
            currentSymbol,
            handleItemMouseEnter,
            handleItemClick,
          )
        : renderEmptyState();
  }

  console.log("coinsForCurrentPage - PopularCoinsList", coinsForCurrentPage);

  return (
    <>
      <h2>Crypto Prices</h2>
      <div className={styles.container}>
        <TextField
          label="Search for a cryptocurrency"
          variant="outlined"
          sx={{
            "& .MuiInputLabel-root": { color: "#b2b2b2" },
            "& .MuiOutlinedInput-root": {
              "& > fieldset": { borderColor: "white", color: "white" },
            },
            "& .MuiOutlinedInput-root.Mui-focused": {
              "& > fieldset": {
                borderColor: "#ff9500",
              },
            },
            "& .MuiOutlinedInput-root:hover": {
              "& > fieldset": {
                borderColor: "#ff9500",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "white",
            },
            "& .MuiInputLabel-root.Mui-hover": {
              color: "white",
            },
            input: { color: "white" },
          }}
          value={search}
          className={styles.input}
          onChange={handleInputChange}
        />
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.nameHeader}>Name</th>
              <th className={styles.priceHeader}>Price</th>
              <th className={styles.volumeHeader}>24hr Volume</th>
              <th className={styles.dayChangeHeader}>24hr Change</th>
              <th className={styles.marketCapHeader}>Market Cap</th>
            </tr>
          </thead>
          <tbody>{contentToDisplay}</tbody>
        </table>
      </div>
      <Pagination />
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
 * @param {boolean} isBreakpoint1250 - True if the current screen width is above 1250 pixels.
 * @param {number} popularCoinsListPageNumber - Current page number in pagination.
 * @param {TCurrencySymbol} currentSymbol - The current currency symbol used for price display.
 * @returns {JSX.Element[]} An array of PopularCoinsListItem components populated with formatted coin data.
 */
function mapCoinsToComponents(
  coinsForCurrentPage: IPopularCoinSearchItem[],
  isBreakpoint1250: boolean,
  popularCoinsListPageNumber: number,
  currentSymbol: TCurrencySymbol,
  handleItemMouseEnter: (id: string) => void,
  handleItemClick: (id: string) => void,
): JSX.Element[] {
  return coinsForCurrentPage.map((listItem, index): JSX.Element => {
    const { coinDetails: coin, matchDetails } = listItem;

    // Define and format necessary properties from the coin data
    const marketCapRank =
      (popularCoinsListPageNumber - 1) * POPULAR_COINS_PAGE_SIZE + index + 1;
    const formattedCurrentPrice = isBreakpoint1250
      ? formatBigNumber(coin.current_price)
      : coin.current_price.toLocaleString("en-US", {
          maximumFractionDigits: 8,
          minimumFractionDigits: 2,
        });

    const formattedVolume =
      coin.volume_24h > 0
        ? isBreakpoint1250
          ? formatBigNumber(coin.volume_24h)
          : coin.volume_24h.toLocaleString()
        : "Info Missing";

    const formattedTotalMarketCap = coin.total_market_cap
      ? isBreakpoint1250
        ? formatBigNumber(coin.total_market_cap)
        : coin.total_market_cap.toLocaleString()
      : "N/A";

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
        handleClick={() => handleItemClick(coin.symbol)}
      />
    );
  });
}
