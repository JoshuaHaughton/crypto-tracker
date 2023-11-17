import { useEffect } from "react";
import { useSelector } from "react-redux";
import PopularCoinsList from "../../../src/components/PopularCoinsList";
import Banner from "../../../src/components/UI/Banner/Banner";
import Pagination from "../../../src/components/UI/Pagination";
import styles from "./index.module.scss";

export default function PopularCoins() {
  const popularCoinsListPageNumber = useSelector(
    (state) => state.appInfo.popularCoinsListPageNumber,
  );

  useEffect(() => {
    if (popularCoinsListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, [popularCoinsListPageNumber]);

  return (
    <div className={styles.container}>
      <Banner />
      <h2>Crypto SPA - Market</h2>
      <PopularCoinsList />
      <Pagination />
    </div>
  );
}
