import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import styles from "./Coin.module.css";
import Image from "next/image";
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

export const useMediaQuery = (width) => {
  const [targetReached, setTargetReached] = useState(false);

  const updateTarget = useCallback((e) => {
    if (e.matches) {
      setTargetReached(true);
    } else {
      setTargetReached(false);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${width}px)`);
    media.addEventListener("change", updateTarget);
    
    // Check on mount (callback is not called until a change occurs)
    if (media.matches) {
      setTargetReached(true);
    }
    
    return () => media.removeEventListener("change", updateTarget);
  }, []);
  
  return targetReached;
};

const Coin = ({
  name,
  price,
  symbol,
  marketcap,
  volume,
  image,
  priceChange,
  id,
  coinSymbol
}) => {
  
  const currentSymbol = useSelector((state) => state.currency.symbol);
  // console.log('props', props)
  // console.log('typeof priceChange', typeof priceChange)
  console.log('image', image)

  return (
    <Link href="/coin/[id]" as={`coin/${id}`}>
      <div className={styles.container}>
        <div className={styles.coin_wrapper}>
          <div className={styles.coin}>
          <figure className={styles.image_wrapper}>
            <Image src={image} height={38} width={38} alt={`${name} image`} className={styles.image} />
          </figure>
            <div className={styles.name_wrapper}>
              <p className={styles.symbol}>{symbol}</p>
              <h1>{name}</h1>
            </div>
          </div>
        </div>

        <p className={styles.price}>{coinSymbol} {price.toLocaleString("en-US", {
                  maximumFractionDigits: 8,
                  minimumFractionDigits: 2,
                })}</p>

        {/* {!isBreakpoint680 &&
          (isBreakpoint1250 ? (
            <p className={styles.volume}>${bigNumberFormatter(volume)}</p>
          ) : (
            <p className={styles.volume}>${volume.toLocaleString()}</p>
          ))} */}

          {(volume !== 0 && volume) && <p className={styles.volume}>{coinSymbol} {volume}</p>}
          {volume === 0 && <p className={styles.volume}>Info Missing</p>}

        {/* <p className={styles.volume}>${volume}</p> */}
        {priceChange < 0 ? (
          <p className={styles.red_percent}>{priceChange.toFixed(2)}%</p>
        ) : (
          <p className={styles.green_percent}>{priceChange.toFixed(2)}%</p>
        )}

        {/* {!isBreakpoint680 &&
          (isBreakpoint1250 ? (
            <p className={styles.market_cap}>
              ${bigNumberFormatter(marketcap)}
            </p>
          ) : (
            <p className={styles.market_cap}>${marketcap.toLocaleString()}</p>
          ))} */}

{marketcap && <p className={styles.market_cap}>{coinSymbol} {marketcap}</p>}

        {/* <p className={styles.market_cap}>
              Mkt Cap: ${marketcap}
            </p> */}
      </div>
    </Link>
  );
};

export default Coin;
