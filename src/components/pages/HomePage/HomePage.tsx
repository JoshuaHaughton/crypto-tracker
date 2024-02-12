"use client";

import PopularCoinsList from "@/components/PopularCoinsList";
import Banner from "@/components/UI/Banner/Banner";
import styles from "./HomePage.module.scss";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function HomePage() {
  const popularCoinsListPageNumber = useSelector(selectPopularCoinsPageNumber);

  useEffect(() => {
    if (popularCoinsListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, [popularCoinsListPageNumber]);

  return (
    <div className={styles.container}>
      <Banner />
      <h2>Crypto Prices</h2>
      <PopularCoinsList />
    </div>
  );
}
