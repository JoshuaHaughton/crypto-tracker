import React from "react";
import { useNavbar } from "./useNavbar";
import styles from "./Navbar.module.scss";
import logo from "../../../../public/Crypto.svg";
import Image from "next/image";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import styled from "@mui/system/styled";
import { outlinedInputClasses } from "@mui/material";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import MobileMenu from "./MobileMenu/MobileMenu";

const vertical = "bottom";
const horizontal = "center";

export const StyledSelect = styled(Select)(`
  & .${outlinedInputClasses.notchedOutline} {
    border-color: white;
    color: white;

    & > svg {
      color: white;
    }
  }
  &:hover .${outlinedInputClasses.notchedOutline} {
    border-color: var(--colors-primary);
  }
  &.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline} {
    border-color: var(--colors-primary);
  }
`);

const Navbar = () => {
  console.log("Navbar render");
  const {
    currentCurrency,
    currentSymbol,
    isMobileMenuOpen,
    isNotificationBarOpen,
    isBreakpoint555,
    closeNotificationBar,
    handleCurrencyChange,
    handleHomepagePreload,
    handleHomepageNavigation,
    openMobileMenu,
    closeMobileMenu,
  } = useNavbar();

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.container}>
          {/* The prefetch field prop for Link to break the router.refresh / currency update logic. */}
          <Link href={"/"} className={styles.container__logo}>
            <Image
              src={logo}
              alt="CryptoTracker Logo"
              fill
              onMouseEnter={handleHomepagePreload}
              // onClick={handleHomepageNavigation}
              quality={100}
              priority
            />
          </Link>
          <ul className={styles.nav__list}>
            <li className={styles.nav__link}>
              <Link
                href={"/"}
                aria-label="Go to the Home Page"
                onMouseEnter={handleHomepagePreload}
              >
                Home
              </Link>
            </li>
            <li className={styles.nav__link}>
              <Link
                href={"/#market"}
                aria-label="Go to the market section on the Home Page"
              >
                Market
              </Link>
            </li>
            <li>
              <StyledSelect
                variant="outlined"
                style={{
                  width: 100,
                  height: 40,
                  marginLeft: 15,
                  color: "white",
                }}
                value={`${currentCurrency.toUpperCase()},${currentSymbol}`}
                defaultValue={`${currentCurrency.toUpperCase()},${currentSymbol}`}
                onChange={handleCurrencyChange}
              >
                <MenuItem value={"CAD,$"}>CAD</MenuItem>
                <MenuItem value={"USD,$"}>USD</MenuItem>
                <MenuItem value={"GBP,£"}>GBP</MenuItem>
                <MenuItem value={"AUD,AU$"}>AUD</MenuItem>
              </StyledSelect>
            </li>
          </ul>
          <FontAwesomeIcon
            icon={faBars}
            className={styles.nav__mobileMenuIcon}
            onClick={openMobileMenu}
            size="2xl"
          />
          {isMobileMenuOpen && (
            <MobileMenu
              currentCurrency={currentCurrency}
              currentSymbol={currentSymbol}
              handleCurrencyChange={handleCurrencyChange}
              closeMenu={closeMobileMenu}
            />
          )}
        </div>
      </nav>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        onClose={closeNotificationBar}
        message="Retrieving New Currency..."
        key={vertical + horizontal}
        open={isNotificationBarOpen}
        ContentProps={{
          className: styles.snackbar,
          classes: {
            root: "errorClass",
          },
        }}
      />
    </>
  );
};

export default Navbar;
