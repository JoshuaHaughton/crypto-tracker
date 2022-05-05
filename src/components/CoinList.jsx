import React, { useState, useCallback, useEffect, useRef } from "react";
import Coin, { useMediaQuery } from "./Coins/Coin";
import styles from "./CoinList.module.css";
import { TextField } from "@mui/material";
import { BorderBottomOutlined } from "@mui/icons-material";
import { useSelector } from "react-redux";

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

const CoinList = ({ filteredCoins, currentPageCoins, isBreakpoint680, isBreakpoint380, isBreakpoint1250, currentSymbol }) => {
  const firstUpdate = useRef(true);
  const [search, setSearch] = useState("");
  const [shownCoins, setShownCoins] = useState(currentPageCoins);
  const [coinSymbol, setCoinSymbol] = useState(currentSymbol || '$')

  const handleChange = (e) => {
    e.preventDefault();

    // useMemo(() => setShownCoins(searchedCoins), []);
    setSearch(e.target.value);

    // setSearch(e.target.value.toLowerCase());
  };

  // const isBreakpoint680 = useMediaQuery(680);
  // const isBreakpoint380 = useMediaQuery(380);

  useEffect(() => {
    if (search !== "") {
      let searchedCoins = filteredCoins?.filter((coin) => {
        return coin.name.toLowerCase().includes(search.toLowerCase());
      });
      setShownCoins(searchedCoins);
    } else {
      setShownCoins(currentPageCoins);
    }
  }, [search]);

  useEffect(() => {
    setShownCoins(currentPageCoins)
    // setCoinSymbol(currentSymbol)
  }, [currentPageCoins])

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    } else {
      setCoinSymbol(currentSymbol)
      console.log('sett', currentSymbol);

    }
  }, [filteredCoins])

  // const isBreakpoint1250 = useMediaQuery(1250);
  // const isBreakpoint680 = useMediaQuery(680);


  return (
    <div className={styles.container}>
      <TextField
        label="Test Input"
        variant="outlined"
        sx={{
          "& .MuiInputLabel-root": {color: '#b2b2b2'},//styles the label
          "& .MuiOutlinedInput-root": {
            "& > fieldset": { borderColor: "white", color: "white" },
          },
          "& .MuiOutlinedInput-root.Mui-focused": {
            "& > fieldset": {
      borderColor: "#ff9500"
            }
          },
          "& .MuiOutlinedInput-root:hover": {
            "& > fieldset": {
              borderColor: "#ff9500"
            }
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: 'white'
          },
          "& .MuiInputLabel-root.Mui-hover": {
            color: 'white'
          },
          input: { color: 'white' }
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
            <p>Volume</p>
          </div>
        )}

        {!isBreakpoint380 && (
          <div className={styles.dayChange_header}>
            <p>24 Hr Change</p>
          </div>
        )}

        {!isBreakpoint680 && (
          <div className={styles.marketCap_header}>
            <p>Market Cap</p>
          </div>
        )}
      </header>
      {shownCoins?.map((coin) => {
        let transformedMarketCap = null
        let transformedVolume = null

        // if (isBreakpoint) {
        //   transformedMarketCap = coin.market_cap.toLocaleString();
        //   transformedVolume = coin.total_volume.toLocaleString();
        // } else {
        //   transformedMarketCap = bigNumberFormatter(coin.market_cap)
        //   transformedVolume = bigNumberFormatter(coin.total_volume)
        // }



        if (!isBreakpoint680) {
          if (isBreakpoint1250) {
            transformedVolume = bigNumberFormatter(coin.total_volume)
            transformedMarketCap = bigNumberFormatter(coin.market_cap)
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
            coinSymbol={coinSymbol}
          />
        );
      })}
    </div>
  );
};

export default React.memo(CoinList);
