import React from "react";
import styles from "./Navbar.module.css";
import logo from "../../../public/Crypto.svg";
import Link from "next/link";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import styled from "@mui/system/styled";
import { outlinedInputClasses } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { currencyActions } from "../../store/currency";
import { useMediaQuery } from "../Coin/Coin";
import { useEffect } from "react";
import { useState } from "react";

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
  const [openNotificationBar, setOpenNotificationBar] = useState(false);
  const currentCurrency = useSelector((state) => state.currency.currency);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const coinListCoins = useSelector((state) => state.coins.coinListCoins);
  const isBreakpoint555 = useMediaQuery(555);
  const dispatch = useDispatch();

  const handleCurrencyChange = (e) => {
    const currency = e.target.value.split(",")[0].toLowerCase();
    const symbol = e.target.value.split(",")[1];

    dispatch(currencyActions.changeCurrency({ currency, symbol }));
    setOpenNotificationBar(true);
  };

  useEffect(() => {
    if (openNotificationBar) setOpenNotificationBar(false);
  }, [coinListCoins]);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div className={styles.logo_container}>
            <Image src={logo} alt="" layout="fill" className={styles.logo} />
          </div>

          <div className={styles.nav_list}>
            <Link href="/" passHref>
              <div className={styles.link_wrapper}>
                <a className={styles.nav_link}>
                  <HomeIcon /> {!isBreakpoint555 && `Home`}
                </a>
              </div>
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
