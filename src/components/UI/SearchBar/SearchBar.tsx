// Import necessary types
import React from "react";
import styles from "./SearchBar.module.scss";

/**
 * Defines the type for the props accepted by the SearchBar component.
 *
 * @typedef SearchBarProps
 * @property {string} placeholder - The placeholder text for the search input field.
 * @property {React.InputHTMLAttributes<HTMLInputElement>} [rest] - The rest of the input attributes.
 */
type SearchBarProps = {
  placeholder: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Renders a search bar form component.
 *
 * This component displays a form specifically designed for search operations, with an input field for user queries.
 * The `placeholder` prop sets a placeholder text in the input field, providing a hint to the user of what to search for.
 * The `{...rest}` spread operator allows passing down additional standard HTML input attributes to the input element.
 *
 * @param {SearchBarProps} props - The props for the SearchBar component.
 * @param {string} props.placeholder - The placeholder text for the search bar.
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props.rest - Additional attributes for the input element.
 * @returns {React.ReactElement} The SearchBar component with a form and an input field.
 */
const SearchBar: React.FC<SearchBarProps> = ({ placeholder, ...rest }) => {
  return (
    <form className={styles.search} autoComplete="off">
      <input
        className={styles.input}
        id="input"
        placeholder={placeholder}
        {...rest}
      />
    </form>
  );
};

export default SearchBar;
