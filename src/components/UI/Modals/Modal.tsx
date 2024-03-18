import React, { useRef } from "react";
import { createPortal } from "react-dom";
import Backdrop from "./Backdrop";
import styles from "./Modal.module.scss";
import useModalFocus from "./useModalFocus";

interface IModalProps {
  closeModal: () => void;
  children: React.ReactNode;
  backdropRootId?: string;
  overlayRootId?: string;
  titleId?: string;
  descId?: string;
}

/**
 * A modal component that can be used to display content in a dialog overlay.
 * Utilizes React portals for rendering the modal elements outside the main app container.
 *
 * @param {IModalProps} props - The properties for the Modal component.
 * @returns {JSX.Element} The rendered JSX element for the modal.
 */
const Modal: React.FC<IModalProps> = ({
  closeModal,
  children,
  backdropRootId = "backdrop-root",
  overlayRootId = "overlay-root",
  titleId,
  descId,
}: IModalProps): JSX.Element => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useModalFocus({ dialogRef, closeModal });

  return (
    <>
      {createPortal(
        <Backdrop closeModal={closeModal} />,
        document.getElementById(backdropRootId) || document.body,
      )}
      {createPortal(
        <dialog
          className={styles.modal}
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          {children}
        </dialog>,
        document.getElementById(overlayRootId) || document.body,
      )}
    </>
  );
};

export default Modal;
