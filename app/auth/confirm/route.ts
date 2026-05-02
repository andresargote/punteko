import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const merchantId = user.user_metadata?.merchant_id;

        if (merchantId) {
          const { error: subError } = await supabase
            .from("subscriptions")
            .upsert(
              { user_id: user.id, merchant_id: merchantId },
              { onConflict: "user_id,merchant_id" },
            );

          if (subError) {
            console.error("Subscription error:", subError.message);
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
