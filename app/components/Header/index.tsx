import Image from "next/image";
import styles from "./Header.module.css";
export function Header() {
  // make the query to retrieve the brand logo and alt

  return (
    <header className={styles.header}>
      <Image src="/kromi.svg" alt="Kromi" width={108} height={48} />
    </header>
  );
}
