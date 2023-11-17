import React from "react";
import classes from "./AuthModal/AuthModal.module.scss";

const Backdrop = ({ closeModal }) => {
  return (
    <div
      className={classes.backdrop}
      onClick={closeModal}
      role="presentation"
      aria-hidden="true"
    />
  );
};

export default Backdrop;
