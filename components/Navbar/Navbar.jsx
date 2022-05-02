import React from "react";
import styles from "./Navbar.module.css";
import logo from "../../public/logo.svg";
import Link from "next/link";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import ListIcon from "@mui/icons-material/List";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.logo_container}>
          <Image
            src={logo}
            alt=""
            height={50}
            width={50}
            className={styles.logo}
          />
          <Link href="/" passHref>
            <a className={styles.title}>Crypto-Tracker</a>
          </Link>
        </div>

        <div className={styles.nav_list}>
          <Link href="/">
            <div className={styles.link_wrapper}>
              
              <a className={styles.nav_link}><HomeIcon /> Home</a>
            </div>
          </Link>

          {/* <div className={styles.link_wrapper}>
            <ListIcon />
            <Link href="/">
              <a className={styles.nav_link}>Cryptocurrencies</a>
            </Link>
          </div> */}
  {/* 
          <Link href="/">
            <div className={styles.link_wrapper}>
              <NewspaperIcon />
              <a className={styles.nav_link}>News</a>
            </div>
          </Link>

          <Link href="/">
            <div className={styles.link_wrapper}>
              <BusinessCenterIcon />
              <a className={styles.nav_link}>Portfolio</a>
            </div>
          </Link> */}

          <Link href="/">
            <div className={styles.link_wrapper}>
              
              <a className={styles.nav_link}><LoginIcon />Login</a>
            </div>
          </Link>

          
          {/* <Link href="/">
            <div className={styles.link_wrapper}>
              <LogoutIcon />
              <a className={styles.nav_link}>Logout</a>
            </div>
          </Link> */}

        </div>

      </div>
    </nav>
  );
};

export default Navbar;
