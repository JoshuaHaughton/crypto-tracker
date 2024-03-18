import Modal from "@/components/UI/Modals/Modal";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import { StyledSelect } from "../Navbar";
import MenuItem from "@mui/material/MenuItem";
import styles from "./MobileMenu.module.scss";
import { SelectChangeEvent } from "@mui/material/Select";

interface IMobileMenuProps {
  currentCurrency: string;
  currentSymbol: string;
  handleCurrencyChange: (e: SelectChangeEvent<unknown>) => Promise<void>;
  closeMenu: () => void;
}

/**
 * MobileMenu component - renders a modal with navigation and currency selection for mobile views.
 *
 * @param {IMobileMenuProps} props - The props for the MobileMenu component.
 * @returns {JSX.Element} The JSX code for MobileMenu component.
 */
const MobileMenu: React.FC<IMobileMenuProps> = ({
  currentCurrency,
  currentSymbol,
  handleCurrencyChange,
  closeMenu,
}: IMobileMenuProps): JSX.Element => {
  return (
    <Modal closeModal={closeMenu}>
      <ul className={styles.menu}>
        <li className={styles.nav__link}>
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
        </li>
        <li className={styles.nav__link}>
          <Link href="#market" onClick={closeMenu}>
            Market
          </Link>
        </li>
        <li>
          <StyledSelect
            key="currency-selector"
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
            <MenuItem value="CAD,$">CAD</MenuItem>
            <MenuItem value="USD,$">USD</MenuItem>
            <MenuItem value="GBP,£">GBP</MenuItem>
            <MenuItem value="AUD,AU$">AUD</MenuItem>
          </StyledSelect>
        </li>
      </ul>
      <FontAwesomeIcon
        icon={faTimes}
        className={styles.menu__closeIcon}
        onClick={closeMenu}
        size="2xl"
      />
    </Modal>
  );
};

export default MobileMenu;
