import Link from "next/link";
import styles from "./Coin.module.css";
import Image from "next/image";
import Cookie from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../../store/coins";
import { useState } from "react";
import { fetchCoinDetailsFromCryptoCompare } from "../../utils/api.utils";
import {
  fetchAndPreloadCoin,
  preloadCoinDetails,
  saveCoinDataForCurrencyInBrowser,
} from "../../utils/cache.utils";
import {
  COINDETAILS_TABLENAME,
  MAXIMUM_PRELOADED_COIN_COUNT,
} from "../../global/constants";
import { postMessageToCurrencyTransformerWorker } from "../../utils/currencyTransformerService";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { appInfoActions } from "../../store/appInfo";

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
  const router = useRouter();
  const currentCurrency = useSelector(
    (state) => state.currency.currentCurrency,
  );
  const currencyRates = useSelector((state) => state.currency.currencyRates);
  const coinCachedDetails = useSelector(
    (state) => state.coins.cachedCoinDetailsByCurrency[currentCurrency][id],
  );
  const isCoinDetailsPreloadedFromDB = useSelector(
    (state) => state.appInfo.isCoinDetailsPreloadedFromDB,
  );
  const coinsBeingFetched = useSelector(
    (state) => state.appInfo.coinsBeingFetched,
  );
  const [waitingForSpecificPreload, setWaitingForSpecificPreload] =
    useState(false);
  const [loading, setLoading] = useState(
    !isCoinDetailsPreloadedFromDB &&
      JSON.parse(localStorage?.getItem("preloadedCoins") || "[]").includes(id),
  );
  const isPreloaded = coinCachedDetails != null;

  const handleMouseEnter = async () => {
    console.log("hover", id);
    console.log("isPreloaded?", isPreloaded);

    // Check if the coin is already preloaded
    if (isPreloaded) {
      console.log(`Coin ${id} is already preloaded.`);
      return;
    }
    await fetchAndPreloadCoin(
      id,
      coinsBeingFetched,
      currentCurrency,
      currencyRates,
      dispatch,
    );
  };

  const handleCoinClick = () => {
    if (isPreloaded) {
      console.log("PRELOADED DATA BEING USED", coinCachedDetails);
      dispatch(
        coinsActions.updateSelectedCoin({
          coinDetails: coinCachedDetails,
        }),
      );
      console.log("ROUTER PUSH WITH PRELOADED DATA", coinCachedDetails);
      // Set the cookie when the coin is clicked
      Cookie.set("usePreloadedData", "true");
      router.push(`/coin/${id}`);
    } else {
      if (!loading && !coinsBeingFetched.includes(id)) {
        console.log(`not preloading ${id}. initiaiting preload.`);
        fetchAndPreloadCoin(
          id,
          coinsBeingFetched,
          currentCurrency,
          currencyRates,
          dispatch,
        );
      }
      console.log("Waiting for specific preload to complete...");
      setWaitingForSpecificPreload(true);
    }
  };

  // Use an effect to handle navigation once specific preloading completes
  useEffect(() => {
    if (waitingForSpecificPreload && isPreloaded) {
      dispatch(
        coinsActions.updateSelectedCoin({
          coinDetails: coinCachedDetails,
        }),
      );
      setWaitingForSpecificPreload(false);
      // Set the cookie when the coin before nav
      Cookie.set("usePreloadedData", "true");
      console.log(
        "ROUTER PUSH AFTER waiting for preloaded data",
        coinCachedDetails,
      );
      router.push(`/coin/${id}`);
    }
  }, [waitingForSpecificPreload, isPreloaded]);

  return (
    // <Link href="/coin/[id]" as={`coin/${id}`} passHref>
    <div
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onClick={handleCoinClick}
    >
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
    // </Link>
  );
};

export default Coin;
