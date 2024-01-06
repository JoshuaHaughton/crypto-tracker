import React from "react";
import Head from "next/head";
import styles from "./Layout.module.scss";
import Navbar from "../Navbar/Navbar";

export const Layout = ({ children, title = "Crypto Tracker" }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Nextjs Crypto Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main>{children}</main>
    </div>
  );
};
