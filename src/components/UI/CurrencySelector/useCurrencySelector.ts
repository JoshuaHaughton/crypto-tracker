import { useState } from "react";
import { TCurrencyString } from "@/lib/constants/globalConstants";

/**
 * Custom hook for managing the state and interactions of a currency selector.
 *
 * @param {TCurrencyString} currentCurrency - The currently selected currency.
 * @param {(currency: TCurrencyString) => void} handleCurrencyChange - Function to call when a new currency is selected.
 * @returns The state and handlers necessary for controlling a currency dropdown.
 */
const useCurrencySelector = (
  currentCurrency: TCurrencyString,
  handleCurrencyChange: (currency: TCurrencyString) => void,
) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectCurrency = (currency: TCurrencyString) => {
    handleCurrencyChange(currency);
    setIsOpen(false); // Close the dropdown after selection
  };

  return {
    isOpen,
    toggleDropdown,
    selectCurrency,
    currentCurrency,
  };
};

export default useCurrencySelector;
