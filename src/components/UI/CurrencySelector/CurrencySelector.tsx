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
  const { isOpen, toggleDropdown } = useCurrencySelector();

  return (
    <div className={styles.currencySelector}>
      <button
        className={styles.currencySelectorButton}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox" // Indicates that the button has a popup list
      >
        {currentCurrency}
        <span
          className={`${styles.arrow} ${isOpen ? styles.right : styles.down}`}
        />
      </button>
      <div
        className={`${styles.currencySelectorOptions} ${
          isOpen ? styles.open : ""
        }`}
        role="listbox" // Role "listbox" indicates this is a list of selectable options
        aria-activedescendant={currentCurrency} // Points to the ID of the active option
      >
        {ALL_CURRENCIES.map((currency) => (
          <button
            key={currency}
            id={currency}
            className={`${styles.currencySelectorOption} ${
              currentCurrency === currency ? styles.selected : ""
            }`}
            onClick={() => handleCurrencyChange(currency)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleCurrencyChange(currency)
            }
            tabIndex={isOpen ? 0 : -1} // Ensures that only options in the open dropdown are focusable
            role="option"
            aria-selected={currentCurrency === currency}
          >
            {currency}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CurrencySelector;
