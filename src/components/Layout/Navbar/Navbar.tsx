import React from "react";
import { useNavbar } from "./useNavbar";
import styles from "./Navbar.module.scss";
import logo from "../../../../public/Crypto.svg";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import styled from "@mui/system/styled";
import { outlinedInputClasses } from "@mui/material";
import Link from "next/link";
import { BLUR_IMG_URL } from "@/lib/constants/globalConstants";

const vertical = "bottom";
const horizontal = "center";

const StyledSelect = styled(Select)(`
  & .${outlinedInputClasses.notchedOutline} {
    border-color: white;
    color: white;

    & > svg {
      color: white;
    }
  }
  &:hover .${outlinedInputClasses.notchedOutline} {
    border-color: #ff9500;
  }
  &.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline} {
    border-color: #ff9500;
  }
`);

const Navbar = () => {
  console.log("Navbar render");
  const {
    openNotificationBar,
    currentCurrency,
    currentSymbol,
    isBreakpoint555,
    setOpenNotificationBar,
    handleCurrencyChange,
    handleHomepagePreload,
    handleHomepageNavigation,
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
                href={"#market"}
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
        </div>
      </nav>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={openNotificationBar}
        onClose={() => setOpenNotificationBar(false)}
        message="Retrieving New Currency..."
        key={vertical + horizontal}
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
