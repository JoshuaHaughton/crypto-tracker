import React from "react";
import { createPortal } from "react-dom";
import Backdrop from "../Backdrop";
import ModalOverlay from "./AuthModalOverlay";

const AuthModal = (props) => {
  return (
    <>
      {createPortal(
        <Backdrop closeModal={props.closeModal} />,
        document.getElementById("backdrop-root"),
      )}
      {createPortal(
        <ModalOverlay
          title={props.title}
          message={props.message}
          closeModal={props.closeModal}
          isSignUp={props.isSignUp}
          setIsSignUp={props.setIsSignUp}
          openSuccessModal={props.openSuccessModal}
        />, document.getElementById('overlay-root')
      )}
    </>
  );
};

export default AuthModal;
