import styles from "./SearchBar.module.css";

const SearchBar = ({ ...rest }) => {
  return (
    <div className={styles.search}>
      <input className={styles.input} {...rest} />
    </div>
  );
};

export default SearchBar;
