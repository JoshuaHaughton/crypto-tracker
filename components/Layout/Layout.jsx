import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "./Layout.module.css";
import logo from "../../public/logo.svg";
import Navbar from "../Navbar/Navbar";
import { useEffect } from "react";
import { auth } from '../../firebase'
import firebase from "firebase/compat/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useDispatch, useSelector } from "react-redux";
import { reduxLogin, reduxLogout } from "../../store/auth";
export const Layout = ({ children, title = "Crypto Tracker" }) => {

  const uid = useSelector((state) => state.auth.uid);
  const isLogged = useSelector((state) => state.auth.isLogged);
  const dispatch = useDispatch();

  useEffect(() => {
    //Check if user is logged via firebase, if so, login locally using redux. Logout locally otherwise.
    auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        //User is logged in
        if (!isLogged) {
          dispatch(
            reduxLogin({
              uid: userAuth.uid,
              full_name: userAuth.displayName,
            }),
          );
        }
      } else {
        //User isn't logged in through firebase anymore, logout
        dispatch(reduxLogout());
      }
    });
  }, [auth, dispatch, isLogged]);

  useEffect(() => {

    //Auto Logout after 60 minutes
    auth.onAuthStateChanged((user) => {
      let userSessionTimeout = null;

      if (user === null && userSessionTimeout) {
        clearTimeout(userSessionTimeout);
        userSessionTimeout = null;
        reduxLogout();
      } else {
        user?.getIdTokenResult().then((idTokenResult) => {
          const authTime = idTokenResult.claims.auth_time * 1000;
          const sessionDurationInMilliseconds = 60 * 60 * 1000; // 60 min
          const expirationInMilliseconds =
            sessionDurationInMilliseconds - (Date.now() - authTime);
          userSessionTimeout = setTimeout(() => {
            auth.signOut();
            reduxLogout();
          }, expirationInMilliseconds);
        });
      }
    });
  }, [auth, uid, dispatch]);

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
