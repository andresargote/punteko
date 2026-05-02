import { redirect } from "next/navigation";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import JoinForm from "../components/JoinForm";
import { createClient } from "../lib/supabase/server";
import styles from "./Join.module.css";

export default async function Join() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/wallet");
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.brandTitle}>¡Únete a Kromi Club!</h1>
        <p className={styles.brandOffer}>
          Compra como siempre y recibe más de lo que esperas. Descuentos
          exclusivos, premios y sorpresas que crecen con cada visita te esperan
          dentro de Kromi.
        </p>
        <JoinForm />
      </main>
      <Footer />
    </div>
  );
}
