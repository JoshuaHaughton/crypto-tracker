import styles from "./PopularCoinsList.module.scss";
import PopularCoinListItem from "./PopularCoinListItem/PopularCoinListItem";
import Pagination from "../Pagination/Pagination";
import { TextField } from "@mui/material";
import { formatBigNumber } from "@/lib/utils/dataFormat.utils";
import { POPULAR_COINS_PAGE_SIZE } from "@/lib/constants/globalConstants";
import { usePopularCoinsList } from "@/components/UI/PopularCoinsList/usePopularCoinsList";

const PopularCoinsList = () => {
  console.log("PopularCoinsList Render");
  const {
    search,
    handleInputChange,
    coinsForCurrentPage,
    isBreakpoint380,
    isBreakpoint680,
    isBreakpoint1250,
    popularCoinsListPageNumber,
    currentSymbol,
  } = usePopularCoinsList();

  console.log("coinsForCurrentPage - PopularCoinsList", coinsForCurrentPage);

  return (
    <>
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
              {!isBreakpoint380 && (
                <th className={styles.priceHeader}>Price</th>
              )}
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
            {coinsForCurrentPage?.map((listItem, index) => {
              const { coinDetails: coin, matchDetails } = listItem;

              const marketCapRank =
                (popularCoinsListPageNumber - 1) * POPULAR_COINS_PAGE_SIZE +
                index +
                1;
              let transformedMarketCap = null;
              let transformedVolume = null;

              if (isBreakpoint1250) {
                transformedVolume = formatBigNumber(coin.volume_24h);
                transformedMarketCap = formatBigNumber(coin.total_market_cap);
              } else {
                transformedVolume = coin.volume_24h.toLocaleString();
                transformedMarketCap = coin.total_market_cap.toLocaleString();
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
      <Pagination />
    </>
  );
};

export default PopularCoinsList;
