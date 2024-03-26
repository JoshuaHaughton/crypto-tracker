import React from "react";
import styles from "./CurrencySelector.module.scss";
import useCurrencySelector from "./useCurrencySelector";
import {
  ALL_CURRENCIES,
  TCurrencyString,
} from "@/lib/constants/globalConstants";

interface CurrencySelectorProps {
  handleCurrencyChange: (currency: TCurrencyString) => void;
  currentCurrency: TCurrencyString;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  handleCurrencyChange,
  currentCurrency,
}) => {
  const { isOpen, toggleDropdown, selectCurrency } = useCurrencySelector(
    currentCurrency,
    handleCurrencyChange,
  );

  return (
    <div className={styles.currencySelector}>
      <div className={styles.currencySelectorButton} onClick={toggleDropdown}>
        {currentCurrency}
        <span
          className={`${styles.arrow} ${isOpen ? styles.right : styles.down}`}
        />
      </div>
      <div
        className={`${styles.currencySelectorOptions} ${
          isOpen ? styles.open : ""
        }`}
      >
        {ALL_CURRENCIES.map((currency) => (
          <div
            key={currency}
            className={`${styles.currencySelectorOption} ${
              currentCurrency === currency ? styles.selected : ""
            }`}
            onClick={() => selectCurrency(currency)}
          >
            {currency}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrencySelector;
