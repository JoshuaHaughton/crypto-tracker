import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "./Layout.module.css";
import logo from "../../public/logo.svg";
import Navbar from "../Navbar/Navbar";
export const Layout = ({ children, title = "Crypto Tracker" }) => {
  return (
    <div className={styles.container}>
      <div id="backdrop-root"></div>
      <div id="overlay-root"></div>

      <div className={styles.layout}>
        <Navbar />

        <main>
          {children}
          <footer className={styles.footer}>
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

              {/* <Link href="/">
                  <a className={styles.footer_link}>Logout</a>
              </Link> */}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
