"use client";

import styles from "./HomePage.module.scss";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectPopularCoinsPageNumber } from "@/lib/store/appInfo/appInfoSelectors";
import Banner from "@/components/UI/Banner/Banner";
import PopularCoinsList from "@/components/UI/PopularCoinsList/PopularCoinsList";

export default function HomePage() {
  console.log("HomePage render");
  const popularCoinsListPageNumber = useSelector(selectPopularCoinsPageNumber);

  useEffect(() => {
    if (popularCoinsListPageNumber !== 1) {
      window.scrollTo(0, 448);
    }
  }, [popularCoinsListPageNumber]);

  return (
    <div className={styles.container}>
      <Banner />
      <PopularCoinsList />
    </div>
  );
}
