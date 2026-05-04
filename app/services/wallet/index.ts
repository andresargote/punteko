import jwt from "jsonwebtoken";

const SERVICE_ACCOUNT = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "",
);

const ISSUER_ID = process.env.WALLET_ISSUER_ID!;
const CLASS_SUFFIX = process.env.WALLET_CLASS_SUFFIX!;

type GenerateWalletParams = {
  name: string;
  membershipNumber: string;
  walletObjectId: string;
  origin: string;
};

export function generateWalletSaveUrl({
  name,
  membershipNumber,
  walletObjectId,
  origin,
}: GenerateWalletParams): string {
  const loyaltyObject = {
    id: `${ISSUER_ID}.${walletObjectId}`,
    classId: `${ISSUER_ID}.${CLASS_SUFFIX}`,
    state: "ACTIVE",
    accountId: membershipNumber,
    accountName: name,
    cardHolderName: name,
    barcode: {
      type: "QR_CODE",
      value: membershipNumber,
    },
    loyaltyPoints: {
      label: "Puntos",
      balance: {
        int: 0,
      },
    },
  };

  const claims = {
    iss: SERVICE_ACCOUNT.client_email,
    aud: "google",
    origins: [origin],
    typ: "savetowallet",
    payload: {
      loyaltyObjects: [loyaltyObject],
    },
  };

  const token = jwt.sign(claims, SERVICE_ACCOUNT.private_key, {
    algorithm: "RS256",
  });

  return `https://pay.google.com/gp/v/save/${token}`;
}
