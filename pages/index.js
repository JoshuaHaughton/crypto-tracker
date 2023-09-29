import { useEffect } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useDispatch, useSelector } from "react-redux";
import { initialCoinsState } from "../src/store/coins";
import { initialCurrencyState } from "../src/store/currency";
import { fetchBaseDataFromCryptoCompare } from "../src/utils/api.utils";
import { initializeCoinListCache } from "../src/thunks/coinListCacheThunk";

export default function Home() {
  const coinListPageNumber = useSelector(
    (state) => state.appInfo.coinListPageNumber,
  );
  // const dispatch = useDispatch();

  useEffect(() => {
    // Using here messes up rendering order because this will go before the app is fully mounted
    // dispatch(initializeCoinListCache());
  }, []);

  useEffect(() => {
    if (coinListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, [coinListPageNumber]);

  return (
    <div className={styles.container}>
      <Banner />
      <h2>Crypto Prices</h2>
      <CoinList />
      <Pagination />
    </div>
  );
}

export async function getStaticProps() {
  try {
    const { initialRates, initialHundredCoins, trendingCarouselCoins } =
      await fetchBaseDataFromCryptoCompare();

    // Update the global cache version cookie
    const currentTimestamp = Date.now().toString();

    return {
      props: {
        initialReduxState: {
          coins: {
            ...initialCoinsState,
            displayedCoinListCoins: initialHundredCoins,
            trendingCarouselCoins: trendingCarouselCoins,
            coinListCoinsByCurrency: {
              ...initialCoinsState.coinListCoinsByCurrency,
              [initialCurrencyState.initialCurrency]: initialHundredCoins,
            },
          },
          currency: {
            ...initialCurrencyState,
            currencyRates: initialRates,
          },
        },
        globalCacheVersion: currentTimestamp, // Add the globalCacheVersion to props
      },
      revalidate: 300, // regenerate the page every 5 minutes
    };
  } catch (err) {
    console.log(err);

    // Return default or placeholder data to prevent breaking the site
    return {
      props: {
        initialReduxState: {
          coins: initialCoinsState,
          currency: initialCurrencyState,
        },
        globalCacheVersion: currentTimestamp, // Add the globalCacheVersion to props
      },
      revalidate: 300, // regenerate the page every 5 minutes
    };
  }
}
