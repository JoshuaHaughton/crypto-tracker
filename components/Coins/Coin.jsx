import React, { useState, useCallback, useEffect } from 'react'
import Link from "next/link";
import styles from "./Coin.module.css";

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
    media.addEventListener("change", updateTarget)

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
}) => {

  const isBreakpoint1250 = useMediaQuery(1250)
  const isBreakpoint680 = useMediaQuery(680)
  
  return (
    <Link href='/coin/[id]' as={`coin/${id}`} >
      <div className={styles.container}>
          <div className={styles.coin_wrapper}>
            <div className={styles.coin}>
              <img src={image} alt={`${name} image`} className={styles.image} />
              <div className={styles.name_wrapper}>
                <p className={styles.symbol}>{symbol}</p>
                <h1>{name}</h1> 
              </div>

            </div>
          </div>
   
            <p className={styles.price}>${price}</p>



{!isBreakpoint680 &&

(isBreakpoint1250 ? <p className={styles.volume}>${bigNumberFormatter(volume)}</p> : <p className={styles.volume}>${volume.toLocaleString()}</p>)

}


            
            {/* <p className={styles.volume}>${volume}</p> */}
            {priceChange < 0 ? (
              <p className={styles.red_percent}>{priceChange.toFixed(2)}%</p>
            ) : (
              <p className={styles.green_percent}>{priceChange.toFixed(2)}%</p>
            )}

{!isBreakpoint680 &&  


(isBreakpoint1250 ? <p className={styles.market_cap}>${bigNumberFormatter(marketcap)}</p> : <p className={styles.market_cap}>${marketcap.toLocaleString()}</p>)


}


            {/* <p className={styles.market_cap}>
              Mkt Cap: ${marketcap}
            </p> */}

        </div>
    </Link>
  );
};

export default Coin;
