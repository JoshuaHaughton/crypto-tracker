import { useState } from "react";
import { TCurrencyString } from "@/lib/constants/globalConstants";

/**
 * Custom hook for managing the state and interactions of a currency selector.
 * @returns The state and handlers necessary for controlling a currency dropdown.
 */
const useCurrencySelector = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return {
    isOpen,
    toggleDropdown,
  };
};

export default useCurrencySelector;
