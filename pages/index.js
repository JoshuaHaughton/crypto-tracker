import { useEffect } from "react";
import CoinList from "../src/components/CoinList";
import Banner from "../src/components/UI/Banner/Banner";
import Pagination from "../src/components/UI/Pagination.jsx";
import styles from "./Home.module.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { useDispatch, useSelector } from "react-redux";
import { initialCoinsState } from "../src/store/coins";
import { initialCurrencyState } from "../src/store/currency";
import { initializeCoinListCache } from "../src/thunks/coinListCacheThunk";
import { fetchBaseDataFromCryptoCompare } from "../src/utils/api.utils";

export default function Home() {
  const dispatch = useDispatch();
  const coinListPageNumber = useSelector(
    (state) => state.appInfo.coinListPageNumber,
  );

  useEffect(() => {
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
      },
      revalidate: 300, // regenerate the page every 5 minutes
    };
  }
}
