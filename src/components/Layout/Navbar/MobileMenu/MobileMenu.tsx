import Modal from "@/components/UI/Modals/Modal";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import styles from "./MobileMenu.module.scss";
import { TCurrencyString } from "@/lib/constants/globalConstants";
import CurrencySelector from "@/components/UI/CurrencySelector/CurrencySelector";

interface IMobileMenuProps {
  currentCurrency: TCurrencyString;
  handleCurrencyChange: (newCurrency: TCurrencyString) => Promise<void>;
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
          <CurrencySelector
            handleCurrencyChange={handleCurrencyChange}
            currentCurrency={currentCurrency}
          />
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
