import React from "react";
import Head from "next/head";
import styles from "./Layout.module.css";
import Navbar from "../Navbar/Navbar";
import { coinsActions } from "../../store/coins";
import { useDispatch } from "react-redux";
import { useState } from "react";
export const Layout = ({ children, title = "Crypto Tracker", coins }) => {

  const dispatch = useDispatch();
  // dispatch(coinsActions.updateCoins({initialHundredCoins: coins.initialHundredCoins, trendingCoins: coins.trendingCoins, symbol: "$"}));
  
  //sets coins to redux state before beginning to render page component (Children) so that there wont be a loading state on intial load 
  dispatch(coinsActions.updateCoins({...coins, symbol: "$"}));

  // const [layoutCoins, setLayoutCoins] = useState(coins)
  
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Nextjs Crypto Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

        <Navbar />

        <main>
          {/* {children} */}
          {React.cloneElement(children, {coins})}
          {/* <footer className={styles.footer}>
            <div className={styles.footer_links}>
              <Link href="/" className={styles.footer_link}>
                  <a >Home</a>
              </Link>

              <Link href="/" className={styles.footer_link}>
                  <a >News</a>
              </Link>

              <Link href="/" className={styles.footer_link}>
                  <a >Portfolio</a>
              </Link>

              <Link href="/" className={styles.footer_link}>
                  <a >Login</a>
              </Link>

              <Link href="/">
                  <a className={styles.footer_link}>Logout</a>
              </Link>
            </div>
          </footer> */}
        </main>
      </div>
  );
};
