import { createClient } from "@/app/lib/supabase/server";

type User = {
  name: string;
  phone: string;
};

// esto ya seria un contrato generico, seria un type geenrico a refactorizar en el futuro
type UserSuccess = {
  success: true;
  data: User;
};

// esto ya seria un contrato generico, seria un type a refactorizar en el futuro
type UserError = {
  success: false;
  error: string;
};

export async function getUser(
  userId: string,
): Promise<UserSuccess | UserError> {
  try {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("name, phone")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error:
          "Ha habido un error al intentar obtener el usuario. Por favor, inténtalo de nuevo o ponte en contacto con el servicio de atención al cliente",
      };
    }

    return {
      data: user,
      success: true,
    };
  } catch (error) {
    // in the future we need to logs the errors
    console.error(error);
    return {
      success: false,
      error:
        "Ha habido un error al intentar obtener el usuario. Por favor, inténtalo de nuevo o ponte en contacto con el servicio de atención al cliente",
    };
  }
}
