import React, { useRef } from "react";
import { createPortal } from "react-dom";
import Backdrop from "./Backdrop";
import classes from "./AuthModal/AuthModal.module.scss";
import useModalFocus from "./useModalFocus";

const Modal = (props) => {
  const {
    closeModal,
    children,
    backdropRootId = "backdrop-root",
    overlayRootId = "overlay-root",
    titleId = "modal-title",
    descId = "modal-description",
  } = props;
  const dialogRef = useRef(null);
  useModalFocus(dialogRef, closeModal);

  return (
    <>
      {createPortal(
        <Backdrop closeModal={closeModal} />,
        document.getElementById(backdropRootId) || document.body,
      )}
      {createPortal(
        <dialog
          className={classes.modal}
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
