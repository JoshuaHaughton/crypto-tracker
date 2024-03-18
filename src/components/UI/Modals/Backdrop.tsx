import React from "react";
import styles from "./Modal.module.scss";

interface IBackdropProps {
  closeModal: () => void;
}

/**
 * A backdrop component used by the Modal for overlaying the screen behind the modal.
 * It renders a semi-transparent backdrop that can be clicked to close the modal.
 *
 * @param {IBackdropProps} props - The properties for the Backdrop component.
 * @returns {JSX.Element} The rendered JSX element for the backdrop.
 */
const Backdrop: React.FC<IBackdropProps> = ({
  closeModal,
}: IBackdropProps): JSX.Element => {
  return (
    <div
      className={styles.backdrop}
      onClick={closeModal}
      role="presentation"
      aria-hidden="true"
    />
  );
};

export default Backdrop;
