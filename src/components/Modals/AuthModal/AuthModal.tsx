import React from "react";
import Modal from "../Modal";
import AuthModalOverlay from "./AuthModalOverlay";

const AuthModal = (props) => {
  return (
    <Modal
      closeModal={props.closeModal}
      backdropRootId="backdrop-root"
      overlayRootId="overlay-root"
    >
      <AuthModalOverlay {...props} />
    </Modal>
  );
};

export default AuthModal;
