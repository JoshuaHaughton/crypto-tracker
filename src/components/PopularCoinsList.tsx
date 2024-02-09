import React, { useState, useEffect, useMemo } from "react";
import PopularCoinListItem from "./PopularCoinListItem/PopularCoinListItem";
import styles from "./PopularCoinsList.module.scss";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { selectPopularCoins } from "@/lib/store/coins/coinsSelectors";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import {
  selectIsBreakpoint1250,
  selectIsBreakpoint380,
  selectIsBreakpoint680,
} from "@/lib/store/mediaQuery/mediaQuerySelectors";
import { selectCurrentSymbol } from "@/lib/store/currency/currencySelectors";
import { bigNumberFormatter } from "@/utils/dataFormat.utils";
import { POPULAR_COINS_PAGE_SIZE } from "@/lib/constants/globalConstants";

const PopularCoinsList = () => {
  const isBreakpoint380 = useSelector(selectIsBreakpoint380);
  const isBreakpoint680 = useSelector(selectIsBreakpoint680);
  const isBreakpoint1250 = useSelector(selectIsBreakpoint1250);
  const displayedPopularCoinsList = useSelector(selectPopularCoins);
  const popularCoinsListPageNumber = useSelector(selectPopularCoinsPageNumber);
  const currentSymbol = useSelector(selectCurrentSymbol);

  const [search, setSearch] = useState("");
  const [shownCoins, setShownCoins] = useState(
    displayedPopularCoinsList?.slice(
      (popularCoinsListPageNumber - 1) * POPULAR_COINS_PAGE_SIZE,
      (popularCoinsListPageNumber - 1) * POPULAR_COINS_PAGE_SIZE +
        POPULAR_COINS_PAGE_SIZE,
    ),
  );

  const currentPageCoins = useMemo(() => {
    const firstPageIndex =
      (popularCoinsListPageNumber - 1) * POPULAR_COINS_PAGE_SIZE;
    const lastPageIndex = firstPageIndex + POPULAR_COINS_PAGE_SIZE;

    if (displayedPopularCoinsList?.length < 1) {
      setShownCoins([]);
      return [];
    } else {
      setShownCoins(
        displayedPopularCoinsList?.slice(firstPageIndex, lastPageIndex),
      );
      return displayedPopularCoinsList?.slice(firstPageIndex, lastPageIndex);
    }
  }, [popularCoinsListPageNumber, displayedPopularCoinsList]);

  console.log("displayedPopularCoinsList", displayedPopularCoinsList);

  const handleChange = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (search !== "") {
      let searchedCoins = displayedPopularCoinsList?.filter((coin) => {
        return coin.name.toLowerCase().includes(search.toLowerCase());
      });
      setShownCoins(searchedCoins);
    } else {
      setShownCoins(currentPageCoins);
    }
  }, [currentPageCoins, displayedPopularCoinsList, search]);

  return (
    <div className={styles.container}>
      <TextField
        label="Search for a cryptocurrency"
        variant="outlined"
        sx={{
          "& .MuiInputLabel-root": { color: "#b2b2b2" }, //styles the label
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
        onChange={handleChange}
      />
      {/* <DataTable columns={columns} data={shownCoins} /> */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.nameHeader}>Name</th>
            {!isBreakpoint380 && <th className={styles.priceHeader}>Price</th>}
            {!isBreakpoint680 && (
              <th className={styles.volumeHeader}>24hr Volume</th>
            )}
            {!isBreakpoint380 && (
              <th className={styles.dayChangeHeader}>24hr Change</th>
            )}
            {!isBreakpoint680 && (
              <th className={styles.marketCapHeader}>Market Cap</th>
            )}
          </tr>
        </thead>
        <tbody>
          {shownCoins?.map((coin, index) => {
            const marketCapRank =
              (popularCoinsListPageNumber - 1) * POPULAR_COINS_PAGE_SIZE +
              index +
              1;
            let transformedMarketCap = null;
            let transformedVolume = null;

            if (!isBreakpoint680) {
              if (isBreakpoint1250) {
                transformedVolume = bigNumberFormatter(coin.volume_24h);
                transformedMarketCap = bigNumberFormatter(
                  coin.total_market_cap,
                );
              } else {
                transformedVolume = coin.volume_24h.toLocaleString();
                transformedMarketCap = coin.total_market_cap.toLocaleString();
              }
            }

            return (
              <PopularCoinListItem
                key={coin.symbol}
                name={coin.name}
                symbol={coin.symbol}
                image={coin.image}
                current_price={coin.current_price}
                total_market_cap={transformedMarketCap}
                market_cap_rank={marketCapRank}
                volume_24h={transformedVolume}
                price_change_percentage_24h={coin.price_change_percentage_24h}
                currentCurrencySymbol={currentSymbol}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PopularCoinsList;
