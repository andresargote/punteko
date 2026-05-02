import { createClient } from "@/app/lib/supabase/server";

type Subscription = {
  membership_number: string;
  wallet_object_id: string;
};

type SubscriptionSuccess = {
  success: true;
  data: Subscription;
};

type SubscriptionError = {
  success: false;
  error: string;
};

export async function getUserSubscription(
  userId: string,
): Promise<SubscriptionSuccess | SubscriptionError> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("subscriptions")
      .select("membership_number, wallet_object_id")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: "No se encontró tu suscripción al programa de lealtad.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Error al obtener tu suscripción. Inténtalo de nuevo.",
    };
  }
}
