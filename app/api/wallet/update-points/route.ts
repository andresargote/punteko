import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

const SERVICE_ACCOUNT = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "",
);

const ISSUER_ID = process.env.WALLET_ISSUER_ID!;

const TIERS = [
  { name: "Oro", threshold: 500 },
  { name: "Plata", threshold: 100 },
  { name: "Bronce", threshold: 0 },
] as const;

function getTier(points: number) {
  return TIERS.find((t) => points >= t.threshold) ?? TIERS[TIERS.length - 1];
}

function getNextTier(points: number) {
  const current = getTier(points);
  const idx = TIERS.indexOf(current);
  return idx > 0 ? TIERS[idx - 1] : null;
}

const auth = new GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
});

export async function PATCH(request: Request) {
  try {
    const { phoneNumber, points, pointsEarned } = await request.json();

    if (!phoneNumber || points === undefined) {
      return NextResponse.json(
        { error: "phoneNumber and points are required" },
        { status: 400 },
      );
    }

    const sanitizedPhone = phoneNumber.replace(/[^a-zA-Z0-9._-]/g, "");
    const resourceId = `${ISSUER_ID}.${sanitizedPhone}`;

    const client = await auth.getClient();
    const response = await client.request({
      url: `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(resourceId)}`,
      method: "PATCH",
      data: {
        loyaltyPoints: {
          label: "Puntos",
          balance: {
            int: points,
          },
        },
      },
    });

    if (pointsEarned !== undefined && pointsEarned > 0) {
      try {
        const nextTier = getNextTier(points);
        let header: string;
        let body: string;

        if (nextTier) {
          const pointsNeeded = nextTier.threshold - points;
          header = `¡Conseguiste ${pointsEarned} puntos!`;
          body = `Te faltan ${pointsNeeded} puntos para ser ${nextTier.name}`;
        } else {
          header = `¡Conseguiste ${pointsEarned} puntos!`;
          body = `¡Ya eres nivel Oro!`;
        }

        await client.request({
          url: `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(resourceId)}/addMessage`,
          method: "POST",
          data: {
            message: {
              header,
              body,
              messageType: "TEXT_AND_NOTIFY",
              id: `msg_${Date.now()}`,
            },
          },
        });
      } catch (msgError: unknown) {
        const err = msgError as { response?: { data?: unknown } };
        console.error("addMessage failed:", err?.response?.data || msgError);
      }
    }

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown } };
    console.error(err?.response?.data || error);
    return NextResponse.json(
      { error: "Failed to update points", details: err?.response?.data },
      { status: err?.response?.status || 500 },
    );
  }
}
