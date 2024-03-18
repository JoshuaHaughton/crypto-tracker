import React from "react";
import styles from "./MobileNavigationArrows.module.scss";

/**
 * Interface for the ArrowButton component props.
 */
interface IArrowButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  isDisabled?: boolean;
}

/**
 * A component that renders a circular button with an arrow.
 *
 * @param {IArrowButtonProps} props - The properties passed to the component.
 * @returns {React.ReactElement} - The rendered button element.
 */
const ArrowButton: React.FC<IArrowButtonProps> = ({
  direction,
  onClick,
  isDisabled = false,
}: IArrowButtonProps): React.ReactElement => {
  return (
    <button
      className={`${styles.arrowButton} ${isDisabled ? styles.disabled : ""}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={direction === "left" ? "Previous" : "Next"}
    >
      <span className={`${styles.arrow} ${styles[direction]}`} />
    </button>
  );
};

/**
 * Interface for the ArrowsNavigation component props.
 */
interface IMobileArrowsNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
}

/**
 * A component that renders left and right navigation arrows.
 *
 * @param {IMobileArrowsNavigationProps} props - The properties passed to the component.
 * @returns {React.ReactElement} - The rendered element with both navigation arrows.
 */
const MobileNavigationArrows: React.FC<IMobileArrowsNavigationProps> = ({
  onPrevious,
  onNext,
  isPreviousDisabled = false,
  isNextDisabled = false,
}) => {
  return (
    <div className={styles.container}>
      <ArrowButton
        direction="left"
        onClick={onPrevious}
        isDisabled={isPreviousDisabled}
      />
      <ArrowButton
        direction="right"
        onClick={onNext}
        isDisabled={isNextDisabled}
      />
    </div>
  );
};

export default MobileNavigationArrows;
