import { redirect } from "next/navigation";
import { Header } from "../components/Header";
import { createClient } from "../lib/supabase/server";
import { getUser } from "../services/user";
import { getUserSubscription } from "../services/subscription";
import { generateWalletSaveUrl } from "../services/wallet";
import styles from "./Wallet.module.css";

export default async function Wallet() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/unirse");
  }

  const userId = user.id;

  const userData = await getUser(userId);

  if (!userData.success) {
    redirect("/unirse");
  }

  const subscriptionData = await getUserSubscription(userId);

  if (!subscriptionData.success) {
    redirect("/unirse");
  }

  const { membership_number, wallet_object_id } = subscriptionData.data;

  const origin = process.env.NEXT_PUBLIC_APP_URL!;
  const saveUrl = generateWalletSaveUrl({
    name: userData.data.name,
    membershipNumber: membership_number,
    walletObjectId: wallet_object_id,
    origin,
  });

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.walletTitle}>
          {userData.data.name} ¡Ya eres parte de Kromi Club!
        </h1>
        <p className={styles.walletCopy}>
          Tu número de membresía: <strong>{membership_number}</strong>
        </p>
        <p className={styles.walletCopy}>
          Añade tu tarjeta a Google Wallet para presentarla en caja y empieza a
          ganar puntos.
        </p>
        <a
          href={saveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.walletButton}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
          >
            <path
              d="M510.992 192.735V107.73c0-49.084-36.4-89.087-81.06-89.087H82.082C37.398 19.09 1 59.093 1 107.73v85.004c0 8.634 6.212 15.462 14.069 15.462h481.876c7.856 0 14.047-6.828 14.047-15.462z"
              fill="#34a853"
            />
            <path
              d="M510.992 267.298V182.74c0-49.107-36.4-89.11-81.06-89.11H82.082C37.398 93.63 1 133.633 1 182.74v85.004c0 8.634 6.212 15.462 14.069 15.462h481.876c7.856-.47 14.047-7.274 14.047-15.908z"
              fill="#fbbc04"
            />
            <path
              d="M510.992 342.308v-85.005c0-49.106-36.4-89.11-81.06-89.11H82.082C37.398 168.193 1 208.197 1 257.303v85.005c0 8.634 6.212 15.438 14.069 15.438h481.876c7.856-.446 14.047-7.273 14.047-15.438z"
              fill="#ea4335"
            />
            <path
              d="M325.282 301.39L1 218.66v187.278c0 49.106 36.399 89.11 81.081 89.11h347.851c44.66 0 81.06-40.004 81.06-89.11V215.024l-77.345 61.823c-31.425 24.988-70.728 34.091-108.365 24.542z"
              fill="#4285f4"
            />
          </svg>
          Añadir a Google Wallet
        </a>
      </main>
    </div>
  );
}
