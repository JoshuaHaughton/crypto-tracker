import React from "react";
import styles from "./Navbar.module.css";
import logo from "../../../public/logo.svg";
import Link from "next/link";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import ListIcon from "@mui/icons-material/List";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import { createTheme, MenuItem, Select } from "@mui/material";
import { borderColor, ThemeProvider } from "@mui/system";
import { makeStyles } from "@mui/styles";
// import { styled } from "@material-ui/core/styles";
import { styled } from "@mui/system";
import { outlinedInputClasses } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { currencyActions } from "../../store/currency";

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

// const useStyles = makeStyles(() => ({
//   customOutline: {
//     "& .MuiOutlinedInput-notchedOutline": {
//       borderColor: "white"
//     }
//   },
//   select: {
//     "&:before": {
//       borderColor: "white",
//     },
//     "&:after": {
//       borderColor: "white",
//     },
//     "&:not(.Mui-disabled):hover::before": {
//       borderColor: "white",
//     },
//   '.MuiOutlinedInput-root-MuiSelect-root': {
//     borderColor: 'white',
//   },
//   '&:hover .MuiOutlinedInput-root': {
//     borderColor: 'white',
//     borderWidth: '0.15rem',
//   },
//   },
//   icon: {
//     fill: "white",
//   },
//   root: {
//     color: "white",
//   },
// }));

const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#fff",
    },
    secondary: {
      main: "#fff",
    },
    type: "dark",
  },
});

const Navbar = () => {
  // const classes = useStyles();
  const currentCurrency = useSelector((state) => state.currency.currency);
  const currentSymbol = useSelector((state) => state.currency.symbol);
  console.log('cur cur',currentCurrency);
  console.log('sym sym',currentSymbol);
  // const dispatch = useDispatch();
  // dispatch(currencyActions.changeCurrency({currency: "test"}))
  const dispatch = useDispatch();

  const handleCurrencyChange = (e) => {

    console.log(e.target.value.split(","));

    const currency = e.target.value.split(",")[0]
    const symbol = e.target.value.split(",")[1]

    dispatch(currencyActions.changeCurrency({currency, symbol}))
  }
  

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
              <a className={styles.nav_link}>
                <HomeIcon /> Home
              </a>
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

          {/* <Link href="/">
            <div className={styles.link_wrapper}>
              <a className={styles.nav_link}>
                <LoginIcon />
                Login
              </a>
            </div>
          </Link> */}

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
