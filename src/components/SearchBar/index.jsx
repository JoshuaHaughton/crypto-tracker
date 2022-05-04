import styles from "./SearchBar.module.css";

const SearchBar = ({ placeholder, ...rest }) => {
  return (
    <form className={styles.search} autoComplete="off">
      <input className={styles.input} id='input' placeholder={placeholder} {...rest} />
    </form>
  );
};

export default SearchBar;
