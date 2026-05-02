import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Link
        href="/"
        aria-label="Ir a la página de inicio"
        className={styles.link}
      >
        by <span className={styles.logo}>PUNTEKO</span>
      </Link>
    </footer>
  );
}
