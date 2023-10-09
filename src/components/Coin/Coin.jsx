import Link from "next/link";
import styles from "./Coin.module.css";
import Image from "next/image";
import Cookie from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { coinsActions } from "../../store/coins";
import { useState } from "react";
import { fetchCoinDetailsFromCryptoCompare } from "../../utils/api.utils";
import {
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
  const selectedCoinDetails = useSelector(
    (state) => state.coins.selectedCoinDetails,
  );
  const cachedDetails = useSelector(
    (state) => state.coins.cachedCoinDetailsByCurrency[currentCurrency],
  );
  const coinCachedDetails = useSelector(
    (state) => state.coins.cachedCoinDetailsByCurrency[currentCurrency][id],
  );
  const currentstateofcache = useSelector(
    (state) => state.coins.cachedCoinDetailsByCurrency,
  );
  const isCoinDetailsPreloadedFromDB = useSelector(
    (state) => state.appInfo.isCoinDetailsPreloadedFromDB,
  );
  const coinsBeingFetched = useSelector(
    (state) => state.appInfo.coinsBeingFetched,
  );
  const [waitingForSpecificPreload, setWaitingForSpecificPreload] =
    useState(false);
  const [isPreloaded, setIsPreloaded] = useState(coinCachedDetails != null);

  const handleMouseEnter = async () => {
    console.log("currentstateofcache", currentstateofcache);
    console.log("cachedDetails", cachedDetails);
    console.log("hover", id);
    console.log("isPreloaded?", isPreloaded);

    // Check if the coin is already preloaded
    if (isPreloaded) {
      console.log(`Coin ${id} is already preloaded.`);
      return;
    }

    // Check if the coin is currently being fetched
    if (coinsBeingFetched.includes(id)) {
      console.error(`Coin ${id} is currently being fetched.`);
      return;
    }

    // Read the current state of the cookie
    let currentPreloadedCoinIds = JSON.parse(
      Cookie.get("preloadedCoins") || "[]",
    );
    console.log("currentPreloadedCoinIds2", currentPreloadedCoinIds);

    // Check if fetching this coin would push us over the maximum count limit
    if (
      currentPreloadedCoinIds.length + coinsBeingFetched.length >=
      MAXIMUM_PRELOADED_COIN_COUNT
    ) {
      console.warn(`Fetching coin ${id} would exceed preloaded coin limit.`);
      return;
    }

    // Add the coin ID to the list of coins being fetched in Redux
    dispatch(appInfoActions.addCoinBeingFetched({ coinId: id }));

    console.log("coins being fetched"), coinsBeingFetched;
    console.log("start fetch");

    try {
      const detailedData = await fetchCoinDetailsFromCryptoCompare(
        id,
        currentCurrency,
      );
      console.log(`Preloaded details for coin ${id}`, detailedData);

      const { initialRates, ...dataWithoutInitialRates } = detailedData;

      await preloadCoinDetails(
        dispatch,
        dataWithoutInitialRates,
        currentCurrency,
        currencyRates,
      );

      setIsPreloaded(true); // Mark this coin as preloaded
    } catch (error) {
      console.error("Error preloading coin data:", error);
    } finally {
      // Remove the coin ID from the list of coins being fetched in Redux
      dispatch(appInfoActions.removeCoinBeingFetched({ coinId: id }));
    }
  };

  const handleCoinClick = () => {
    const isPartOfPreloadedCoins = JSON.parse(
      Cookie.get("preloadedCoins") || "[]",
    ).includes(id);

    if (isPreloaded) {
      console.log("PRELOADED DATA BEING USED", coinCachedDetails);
      dispatch(
        coinsActions.updateSelectedCoin({
          coinDetails: coinCachedDetails,
        }),
      );
      console.log("ROUTER PUSH WITH PRELOADED DATA", selectedCoinDetails);
      router.push(`/coin/${id}`);
    } else if (isPartOfPreloadedCoins && !isCoinDetailsPreloadedFromDB) {
      console.log("Waiting for specific preload to complete...");
      setWaitingForSpecificPreload(true);
    } else {
      console.log("ROUTER PUSH WITHOUT PRELOADED DATA", selectedCoinDetails);
      router.push(`/coin/${id}`);
    }
  };

  useEffect(() => {
    if (isCoinDetailsPreloadedFromDB && coinCachedDetails) {
      setIsPreloaded(true);
    }
  }, [isCoinDetailsPreloadedFromDB, coinCachedDetails]);

  // Use an effect to handle navigation once specific preloading completes
  useEffect(() => {
    if (waitingForSpecificPreload && isPreloaded && coinCachedDetails != null) {
      dispatch(
        coinsActions.updateSelectedCoin({
          coinDetails: coinCachedDetails,
        }),
      );
      setWaitingForSpecificPreload(false);
      console.log(
        "ROUTER PUSH AFTER waiting for preloaded data",
        selectedCoinDetails,
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
