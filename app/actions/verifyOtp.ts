"use server";

import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

export async function verifyOtp(data: {
  phone: string;
  token: string;
  merchantSlug: string;
  name: string;
  countryCode: string;
  consent: boolean;
}) {
  const supabase = await createClient();

  const { error: verifyError } = await supabase.auth.verifyOtp({
    phone: data.phone,
    token: data.token,
    type: "sms",
  });

  if (verifyError) {
    return { error: "Código inválido o expirado. Inténtalo de nuevo" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No se pudo obtener tu usuario. Inténtalo de nuevo" };
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("slug", data.merchantSlug)
    .single();

  if (!merchant) {
    return { error: "Comercio no encontrado" };
  }

  const { error: userError } = await supabase.from("users").upsert({
    id: user.id,
    name: data.name,
    phone: data.phone,
    country_code: data.countryCode,
    consent: data.consent,
  });

  if (userError) {
    console.log("userError", userError);
    return { error: "Error al crear tu perfil. Inténtalo de nuevo" };
  }

  const { error: subError } = await supabase
    .from("subscriptions")
    .insert({ user_id: user.id, merchant_id: merchant.id });

  console.log("subError", subError);

  if (subError) {
    if (subError.code === "23505" || subError.code === "23503") {
      return { success: true };
    }
    return { error: "Error al unirte al programa. Inténtalo de nuevo" };
  }

  return redirect("/wallet");
}
