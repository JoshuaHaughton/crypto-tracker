import React, { useState } from "react";
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
import AuthModal from "../UI/Modals/AuthModal/AuthModal";
import SuccessModal from "../UI/Modals/SuccessModal/SuccessModal";
import { useDispatch, useSelector } from "react-redux";
import { reduxLogout } from "../../store/auth";
import { signOut, getAuth } from 'firebase/auth'

const Navbar = () => {
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const auth = getAuth()
  const isLogged = useSelector((state) => state.auth.isLogged);
  const uid = useSelector((state) => state.auth.uid);
  const dispatch = useDispatch();

  

  const openSuccessModalHandler = () => {
    setOpenSuccessModal(true);
  };

  const closeSuccessModalHandler = () => {
    setOpenSuccessModal(false);
  };

  const openAuthModalHandler = () => {
    setOpenAuthModal(true);
  };

  const closeAuthModalHandler = () => {
    setOpenAuthModal(false);
  };

  const logoutHandler = () => {
    dispatch(reduxLogout());
    signOut(auth);
  };

  return (
    <>
      {openSuccessModal && (
        <SuccessModal
          title={isSignUp ? "Sign Up Successful!" : "Log In Successful!"}
          message={
            isSignUp
              ? "Thank you for signing up!"
              : "Welcome Back! Login Successful."
          }
          closeModal={closeSuccessModalHandler}
        />
      )}
      {openAuthModal && (
        <AuthModal
          title={"test title"}
          message={"test message"}
          closeModal={closeAuthModalHandler}
          openSuccessModal={openSuccessModalHandler}
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
        />
      )}
      <nav className={styles.container}>
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
              <HomeIcon />
              <a className={styles.nav_link}>Home</a>
            </div>
          </Link>

          {/* <div className={styles.link_wrapper}>
            <ListIcon />
            <Link href="/">
              <a className={styles.nav_link}>Cryptocurrencies</a>
            </Link>
          </div> */}

          <Link href="/">
            <div className={styles.link_wrapper}>
              <NewspaperIcon />
              <a className={styles.nav_link}>News</a>
            </div>
          </Link>

          {isLogged && <Link href="/">
            <div className={styles.link_wrapper}>
              <BusinessCenterIcon />
              <a className={styles.nav_link}>Portfolio</a>
            </div>
          </Link>}

          {!isLogged && <button className={styles.nav_button}>
            <div className={styles.link_wrapper} onClick={openAuthModalHandler}>
              <LoginIcon />
              <a className={styles.nav_link}>Login</a>
            </div>
          </button>}


          {isLogged && <button className={styles.nav_button}>
            <div className={styles.link_wrapper} onClick={logoutHandler}>
              <LogoutIcon />
              <a className={styles.nav_link}>Logout</a>
            </div>
          </button>}

      
        </div>
      </nav>
    </>
  );
};

export default Navbar;
