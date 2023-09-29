import Link from "next/link";
import styles from "./Coin.module.css";
import Image from "next/image";
import Cookie from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../../store/coins";
import { useState } from "react";
import { fetchCoinDetailsFromCryptoCompare } from "../../utils/api.utils";
import { saveCoinDataForCurrencyInBrowser } from "../../utils/cache.utils";
import { COINDETAILS_TABLENAME } from "../../global/constants";

const Coin = ({
  name,
  price,
  symbol,
  marketcap,
  volume,
  image,
  priceChange,
  id,
  coinSymbol,
}) => {
  const dispatch = useDispatch();
  const [isPreloaded, setIsPreloaded] = useState(false);
  const currentCurrency = useSelector(
    (state) => state.currency.currentCurrency,
  );
  const cachedDetails = useSelector(
    (state) => state.coins.cachedCoinDetailsByCurrency[currentCurrency],
  );
  const currentstateofcache = useSelector(
    (state) => state.coins.cachedCoinDetailsByCurrency,
  );

  const handleMouseEnter = async () => {
    console.log("currentstateofcache", currentstateofcache);
    console.log("cachedDetails", cachedDetails);
    console.log("hover", id);
    console.log("isPreloaded?", isPreloaded);

    if (isPreloaded) return;

    // Ensure cachedDetails is defined
    const details = cachedDetails || {};

    // If details already exist in Redux state for this coin, then return early
    if (details[id]) {
      return;
    }

    console.log("start fetch");

    try {
      const detailedData = await fetchCoinDetailsFromCryptoCompare(
        id,
        currentCurrency,
        true,
      );
      console.log(`Preloaded details for coin ${id}`, detailedData);

      const { initialRates, ...dataWithoutInitialRates } = detailedData;

      // Update the Redux state with the fetched data
      dispatch(
        coinsActions.setCachedCoinDetailsByCurrency({
          currency: currentCurrency,
          coinData: dataWithoutInitialRates,
        }),
      );

      // Save the data to IndexedDB
      await saveCoinDataForCurrencyInBrowser(
        COINDETAILS_TABLENAME,
        currentCurrency,
        dataWithoutInitialRates,
      );

      // Read the current state of the cookie
      const currentPreloadedCoinIds = JSON.parse(
        Cookie.get("preloadedCoins") || "[]",
      );

      // Add the new coin ID if it's not already there
      if (!currentPreloadedCoinIds.includes(id)) {
        currentPreloadedCoinIds.push(id);
      }

      // Update the cookie with the extended list of coin IDs
      Cookie.set("preloadedCoins", JSON.stringify(currentPreloadedCoinIds));
      console.log(
        "SET PRELOADED COOKIE",
        JSON.stringify(currentPreloadedCoinIds),
      );

      setIsPreloaded(true); // Mark this coin as preloaded
    } catch (error) {
      console.error("Error preloading coin data:", error);
    }
  };

  return (
    <Link href="/coin/[id]" as={`coin/${id}`} passHref>
      <div className={styles.container} onMouseEnter={handleMouseEnter}>
        <div className={styles.coin_wrapper}>
          <div className={styles.coin}>
            <figure className={styles.image_wrapper}>
              <Image
                src={image}
                height={38}
                width={38}
                alt={`${name} image`}
                className={styles.image}
              />
            </figure>
            <div className={styles.name_wrapper}>
              <p className={styles.symbol}>{symbol}</p>
              <h1>{name}</h1>
            </div>
          </div>
        </div>

        <p className={styles.price}>
          {coinSymbol}{" "}
          {price.toLocaleString("en-US", {
            maximumFractionDigits: 8,
            minimumFractionDigits: 2,
          })}
        </p>

        {volume !== 0 && volume && (
          <p className={styles.volume}>
            {coinSymbol} {volume}
          </p>
        )}
        {volume === 0 && <p className={styles.volume}>Info Missing</p>}

        {priceChange < 0 ? (
          <p className={styles.red_percent}>{priceChange.toFixed(2)}%</p>
        ) : (
          <p className={styles.green_percent}>{priceChange.toFixed(2)}%</p>
        )}

        {marketcap && (
          <p className={styles.market_cap}>
            {coinSymbol} {marketcap}
          </p>
        )}
      </div>
    </Link>
  );
};

export default Coin;
