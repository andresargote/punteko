import styles from "./Spinner.module.css";

export const Spinner = ({ size = "1.25rem", className = "" }) => {
  return (
    <span
      className={`${styles.rtSpinner} ${className}`}
      style={{ width: size, height: size }}
    >
      {[...Array(8)].map((_, i) => (
        <span key={i} className={styles.rtSpinnerLeaf} />
      ))}
    </span>
  );
};
