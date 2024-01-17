import React, { useState, useEffect, useMemo } from "react";
import Coin from "./Coin/PopularCoinListItem";
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
import {
  selectCurrentCurrency,
  selectCurrentSymbol,
} from "@/lib/store/currency/currencySelectors";
import { DataTable } from "./PopularCoinsTable";
import { columns } from "./PopularCoinsTable/columns";

const bigNumberFormatter = (num) => {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(1) + "K"; // convert to K for numbers > 1000 < 1 million
  } else if (num > 1000000 && num < 1000000000) {
    return (num / 1000000).toFixed(1) + "M"; // convert to M for numbers > 1 million
  } else if (num > 1000000000 && num < 1000000000000) {
    return (num / 1000000000).toFixed(1) + "B"; // convert to B for numbers > 1 billion
  } else if (num > 1000000000000) {
    return (num / 1000000000000).toFixed(1) + "T"; // convert to T for numbers > 1 trillion
  } else if (num <= 999) {
    return num; // if value < 1000, nothing to do
  }
};

const PageSize = 10;

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
      (popularCoinsListPageNumber - 1) * PageSize,
      (popularCoinsListPageNumber - 1) * PageSize + PageSize,
    ),
  );

  const currentPageCoins = useMemo(() => {
    const firstPageIndex = (popularCoinsListPageNumber - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;

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

  console.log("ye", shownCoins);
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
              (popularCoinsListPageNumber - 1) * PageSize + index + 1;
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
              <Coin
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

      {/* <header className={styles.header}>
        <div className={styles.name_header}>
          <p>Name</p>
        </div>
        {!isBreakpoint380 && (
          <div className={styles.price_header}>
            <p>Price</p>
          </div>
        )}
        {!isBreakpoint680 && (
          <div className={styles.volume_header}>
            <p>24hr Volume</p>
          </div>
        )}

        {!isBreakpoint380 && (
          <div className={styles.dayChange_header}>
            <p>24hr Change</p>
          </div>
        )}

        {!isBreakpoint680 && (
          <div className={styles.marketCap_header}>
            <p>Market Cap</p>
          </div>
        )}
      </header>
      {shownCoins?.map((coin) => {
        let transformedMarketCap = null;
        let transformedVolume = null;

        if (!isBreakpoint680) {
          if (isBreakpoint1250) {
            transformedVolume = bigNumberFormatter(coin.volume_24h);
            transformedMarketCap = bigNumberFormatter(coin.total_market_cap);
          } else {
            transformedVolume = coin.volume_24h.toLocaleString();
            transformedMarketCap = coin.total_market_cap.toLocaleString();
          }
        }

        return (
          <Coin
            key={coin.symbol}
            name={coin.name}
            id={coin.symbol}
            price={coin.current_price}
            symbol={coin.symbol}
            marketcap={transformedMarketCap}
            volume={transformedVolume}
            image={coin.image}
            priceChange={coin.price_change_percentage_24h}
            coinSymbol={currentSymbol}
          />
        );
      })} */}
    </div>
  );
};

export default PopularCoinsList;
