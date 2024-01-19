"use client";
import React from "react";
import styles from "./Navbar.module.scss";
import logo from "../../../public/Crypto.svg";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import styled from "@mui/system/styled";
import { outlinedInputClasses } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { updateCurrency } from "../../thunks/updateCurrencyThunk";
// import { usePopularCoinsListPreloader } from "../../hooks/preloaders/usePopularCoinsListPreloader";
import Link from "next/link";
import {
  selectCurrentCurrency,
  selectCurrentSymbol,
} from "@/lib/store/currency/currencySelectors";
import { selectIsBreakpoint555 } from "@/lib/store/mediaQuery/mediaQuerySelectors";
import { currencyActions } from "@/lib/store/currency/currencySlice";

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
  const dispatch = useDispatch();
  const [openNotificationBar, setOpenNotificationBar] = useState(false);
  const currentCurrency = useSelector(selectCurrentCurrency);
  const currentSymbol = useSelector(selectCurrentSymbol);
  const isBreakpoint555 = useSelector(selectIsBreakpoint555);
  console.log("currentCurrency", currentCurrency);

  const handleCurrencyChange = (e) => {
    const currency = e.target.value.split(",")[0].toUpperCase();

    dispatch(currencyActions.setCurrencyRates);
  };

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.container}>
          <Link href="/" passHref className={styles.logo_container}>
            <Image
              src={logo}
              alt="Logo"
              layout="fill"
              className={styles.logo}
            />
          </Link>

          <div className={styles.nav_list}>
            <Link href="/" passHref className={styles.link_wrapper}>
              <HomeIcon /> {!isBreakpoint555 && `Home`}
            </Link>

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
              <MenuItem value={"CAD,$"} className={styles.menu_item}>
                CAD
              </MenuItem>
              <MenuItem value={"USD,$"} className={styles.menu_item}>
                USD
              </MenuItem>
              <MenuItem value={"GBP,£"} className={styles.menu_item}>
                GBP
              </MenuItem>
              <MenuItem value={"AUD,AU$"} className={styles.menu_item}>
                AUD
              </MenuItem>
            </StyledSelect>
          </div>
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
