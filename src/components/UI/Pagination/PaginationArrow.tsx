import React from "react";
import styles from "./Pagination.module.scss";

const ArrowDirections = {
  Left: "left",
  Right: "right",
} as const;

type ArrowDirection = (typeof ArrowDirections)[keyof typeof ArrowDirections];

interface PaginationArrowProps {
  direction: ArrowDirection;
  onClick: () => void;
  isDisabled: boolean;
}

/**
 * Component to render an arrow button for pagination navigation (either left or right).
 *
 * @param {PaginationArrowProps} props - Properties for the PaginationArrow component.
 * @param {'left' | 'right'} props.direction - Direction of the arrow, determining its orientation.
 * @param {Function} props.onClick - Callback function to be called when the arrow is clicked.
 * @param {boolean} props.isDisabled - Indicates whether the button should be disabled.
 * @returns {React.ReactElement} The PaginationArrow component.
 */
const PaginationArrow: React.FC<PaginationArrowProps> = ({
  direction,
  onClick,
  isDisabled,
}) => {
  // Check if the key pressed is either Enter or Space
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (!isDisabled && (event.key === "Enter" || event.key === " ")) {
      onClick();
    }
  };

  return (
    <li
      className={`${styles.item} ${isDisabled ? styles.disabled : ""}`}
      role="button"
      tabIndex={!isDisabled ? 0 : undefined}
      onClick={!isDisabled ? onClick : undefined}
      onKeyDown={!isDisabled ? handleKeyPress : undefined}
      aria-disabled={isDisabled}
      aria-label={
        direction === ArrowDirections.Left
          ? "Go to previous page"
          : "Go to next page"
      }
    >
      <div
        className={`${styles.arrow} ${
          direction === ArrowDirections.Left ? styles.left : styles.right
        }`}
      />
    </li>
  );
};

export default PaginationArrow;
