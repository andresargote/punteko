"use server";

import { createClient } from "../lib/supabase/server";

type SignInWithOtp = {
  phone: string;
  merchantSlug: string;
};

export async function signUpWithPhone({ phone, merchantSlug }: SignInWithOtp) {
  const supabase = await createClient();

  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select("id")
    .eq("slug", merchantSlug)
    .single();

  if (merchantError || !merchant) {
    return { error: "Comercio no encontrado" };
  }

  const { error: otpError } = await supabase.auth.signInWithOtp({
    phone: phone,
  });

  if (otpError) {
    return {
      error: "Hubo un error al enviar el código. Por favor, inténtalo de nuevo",
    };
  }

  return { success: true };
}
