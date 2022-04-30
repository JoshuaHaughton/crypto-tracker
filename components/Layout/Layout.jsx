import Head from "next/head";
import styles from "./Layout.module.css";
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

        <main>
          {children}
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
