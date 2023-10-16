import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Carousel.module.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookie from "js-cookie";
import { useRouter } from "next/router";
import { useState } from "react";
import { fetchAndPreloadCoin } from "../../../utils/cache.utils";
import { coinsActions } from "../../../store/coins";

const CarouselCoin = ({ coin, currentSymbol }) => {
  const { id } = coin;
  let profit = coin.price_change_percentage_24h >= 0;
  const dispatch = useDispatch();
  const router = useRouter();
  const currentCurrency = useSelector(
    (state) => state.currency.currentCurrency,
  );
  const currencyRates = useSelector((state) => state.currency.currencyRates);
  const coinCachedDetails = useSelector(
    (state) =>
      state.coins.cachedCoinDetailsByCurrency[currentCurrency][coin.id],
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
      coin.id,
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
          coin.id,
          coinsBeingFetched,
          currentCurrency,
          currencyRates,
          dispatch,
        );
      }
      startProgressBar();
      setWaitingForSpecificPreload(true);
      console.log("Waiting for specific preload to complete...");
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
    <div
      className={styles.carousel_item}
      onMouseEnter={handleMouseEnter}
      onClick={handleCoinClick}
    >
      <Link href={`/coin/${coin.id}`} passHref>
        <Image src={coin.image} alt={coin.name} height={80} width={80} />
      </Link>
      <p>
        {coin?.symbol.toUpperCase()}&nbsp;
        {profit ? (
          <span className={styles.green}>
            +
            {coin.price_change_percentage_24h.toLocaleString("en-US", {
              maximumFractionDigits: 5,
              minimumFractionDigits: 2,
            })}
            %
          </span>
        ) : (
          <span className={styles.red}>
            {coin.price_change_percentage_24h.toLocaleString("en-US", {
              maximumFractionDigits: 5,
              minimumFractionDigits: 2,
            })}
            %
          </span>
        )}
      </p>
      <h6>
        {currentSymbol}
        {coin?.current_price.toLocaleString("en-US", {
          maximumFractionDigits: 8,
          minimumFractionDigits: 2,
        })}
      </h6>
    </div>
  );
};

export default CarouselCoin;
