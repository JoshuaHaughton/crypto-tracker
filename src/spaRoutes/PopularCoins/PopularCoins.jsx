import { useEffect } from "react";
import { useSelector } from "react-redux";
import PopularCoinsList from "../../components/PopularCoinsList";
import Banner from "../../components/UI/Banner/Banner";
import Pagination from "../../components/UI/Pagination.jsx";
import styles from "./PopularCoins.module.css";

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
      <h2>Crypto Spa slices</h2>
      <PopularCoinsList />
      <Pagination />
    </div>
  );
}
