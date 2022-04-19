import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./SuccessModal.module.css";

const SuccessModalOverlay = (props) => {
  return (
    <div className={`${styles.modal} ${styles.card}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>{props.title}</h2>
        <div className={styles.exit} onClick={props.closeModal}>
          <FontAwesomeIcon icon={faTimes} className={styles.exitIcon} />
        </div>
      </header>
      <div className={styles.content}>
        <p className={styles.text}>{props.message}</p>
        <br />
        <p>Have a great day!</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.button} onClick={props.closeModal}>
          Okay
        </button>
      </div>
    </div>
  );
};

export default SuccessModalOverlay;
