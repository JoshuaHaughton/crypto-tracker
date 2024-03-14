"use client";

import styles from "./HomePage.module.scss";
import Banner from "@/components/UI/Banner/Banner";
import PopularCoinsList from "@/components/UI/PopularCoinsList/PopularCoinsList";

export default function HomePage() {
  console.log("HomePage render");

  return (
    <div className={styles.container}>
      <Banner />
      <PopularCoinsList />
    </div>
  );
}
