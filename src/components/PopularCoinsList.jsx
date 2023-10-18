import React, { useState, useEffect, useMemo } from "react";
import Coin from "./Coin/Coin";
import styles from "./PopularCoinsList.module.css";
import { TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

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

const PopularCoinsList = ({ initialHundredCoins }) => {
  const dispatch = useDispatch();
  const isBreakpoint380 = useSelector(
    (state) => state.mediaQuery.isBreakpoint380,
  );
  const isBreakpoint680 = useSelector(
    (state) => state.mediaQuery.isBreakpoint680,
  );
  const isBreakpoint1250 = useSelector(
    (state) => state.mediaQuery.isBreakpoint1250,
  );
  const displayedPopularCoinsListCoins = useSelector(
    (state) => state.coins.displayedPopularCoinsListCoins,
  );
  console.log(displayedPopularCoinsListCoins);
  const popularCoinsListPageNumber = useSelector(
    (state) => state.appInfo.popularCoinsListPageNumber,
  );
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const currentCurrency = useSelector(
    (state) => state.currency.currentCurrency,
  );
  const [search, setSearch] = useState("");
  const [shownCoins, setShownCoins] = useState(
    displayedPopularCoinsListCoins.slice(
      (popularCoinsListPageNumber - 1) * PageSize,
      (popularCoinsListPageNumber - 1) * PageSize + PageSize,
    ),
  );

  const currentPageCoins = useMemo(() => {
    const firstPageIndex = (popularCoinsListPageNumber - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;

    if (displayedPopularCoinsListCoins.length < 1) {
      setShownCoins(initialHundredCoins.slice(firstPageIndex, lastPageIndex));
      return initialHundredCoins.slice(firstPageIndex, lastPageIndex);
    } else {
      setShownCoins(
        displayedPopularCoinsListCoins.slice(firstPageIndex, lastPageIndex),
      );
      return displayedPopularCoinsListCoins.slice(
        firstPageIndex,
        lastPageIndex,
      );
    }
  }, [
    popularCoinsListPageNumber,
    displayedPopularCoinsListCoins,
    initialHundredCoins,
  ]);

  const handleChange = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (search !== "") {
      let searchedCoins = displayedPopularCoinsListCoins?.filter((coin) => {
        return coin.name.toLowerCase().includes(search.toLowerCase());
      });
      setShownCoins(searchedCoins);
    } else {
      setShownCoins(currentPageCoins);
    }
  }, [search]);

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
      <header className={styles.header}>
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
            transformedVolume = bigNumberFormatter(coin.total_volume);
            transformedMarketCap = bigNumberFormatter(coin.market_cap);
          } else {
            transformedVolume = coin.total_volume.toLocaleString();
            transformedMarketCap = coin.market_cap.toLocaleString();
          }
        }

        return (
          <Coin
            key={coin.id}
            name={coin.name}
            id={coin.id}
            price={coin.current_price}
            symbol={coin.symbol}
            marketcap={transformedMarketCap}
            volume={transformedVolume}
            image={coin.image}
            priceChange={coin.price_change_percentage_24h}
            coinSymbol={currentSymbol}
          />
        );
      })}
    </div>
  );
};

export default PopularCoinsList;
