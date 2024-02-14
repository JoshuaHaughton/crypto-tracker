import React from "react";
import styles from "./Pagination.module.scss";
import { ELLIPSES } from "@/lib/constants/globalConstants";

interface IPaginationItemProps {
  pageNumber: number | typeof ELLIPSES;
  isCurrent: boolean;
  onClick: () => void;
}

/**
 * Component to render a single pagination item. This can be a page number or the ellipsis symbol.
 *
 * @param {IPaginationItemProps} props The properties for the PaginationItem component.
 * @param {number | typeof ELLIPSES} props.pageNumber The page number or the ELLIPSES constant for ellipses.
 * @param {boolean} props.isCurrent Indicates if the item represents the current page.
 * @param {Function} props.onClick Callback function to be called when the item is clicked, except for ellipses.
 * @returns {React.ReactElement} The rendered PaginationItem, displaying either a page number or ellipses.
 */
const PaginationItem: React.FC<IPaginationItemProps> = ({
  pageNumber,
  isCurrent,
  onClick,
}: IPaginationItemProps): React.ReactElement => {
  // Determine the content to render based on whether the item is a page number or ellipses
  const isEllipsis = pageNumber === ELLIPSES;
  const itemClasses = `${styles.item} ${isCurrent ? styles.selected : ""} ${
    isEllipsis ? styles.dots : ""
  }`;

  const content = isEllipsis ? <>&#8230;</> : pageNumber;

  // Check if the key pressed is either Enter or Space
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      onClick();
    }
  };

  return (
    <li
      className={itemClasses}
      role={!isEllipsis ? "button" : undefined}
      tabIndex={!isEllipsis ? 0 : undefined}
      aria-current={isCurrent ? "page" : undefined}
      onClick={() => !isEllipsis && onClick()}
      onKeyDown={!isEllipsis ? handleKeyPress : undefined}
      aria-label={!isEllipsis ? `Go to page ${pageNumber}` : "Ellipses"}
    >
      {content}
    </li>
  );
};

export default PaginationItem;
