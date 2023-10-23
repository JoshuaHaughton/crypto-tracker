import React from "react";
import styles from "./Navbar.module.css";
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
import { usePopularCoinsListPreloader } from "../../hooks/preloaders/usePopularCoinsListPreloader";

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
  const currentCurrency = useSelector(
    (state) => state.currency.currentCurrency,
  );
  const currentSymbol = useSelector((state) => state.currency.symbol);
  const isBreakpoint555 = useSelector(
    (state) => state.mediaQuery.isBreakpoint555,
  );
  const { handleLinkClick, handleLinkHover } = usePopularCoinsListPreloader();

  const handleCurrencyChange = (e) => {
    const currency = e.target.value.split(",")[0].toUpperCase();

    dispatch(updateCurrency({ currency }));
  };

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div
            className={styles.logo_container}
            onClick={handleLinkClick}
            onMouseEnter={handleLinkHover}
          >
            <Image src={logo} alt="" layout="fill" className={styles.logo} />
          </div>

          <div className={styles.nav_list}>
            <div
              className={styles.link_wrapper}
              onClick={handleLinkClick}
              onMouseEnter={handleLinkHover}
            >
              <HomeIcon /> {!isBreakpoint555 && `Home`}
            </div>

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
