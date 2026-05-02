export type CountryCode = "VE" | "US" | "ES" | "MX";

export const COUNTRY_CONFIG: Record<
  CountryCode,
  { prefix: string; minLength: number; placeholder: string }
> = {
  VE: { prefix: "+58", minLength: 10, placeholder: "412-345-6789" },
  US: { prefix: "+1", minLength: 10, placeholder: "412-345-6789" },
  ES: { prefix: "+34", minLength: 9, placeholder: "612-345-678" },
  MX: { prefix: "+52", minLength: 10, placeholder: "55-1234-5678" },
};

export const COUNTRIES = [
  { code: "VE" as CountryCode, flag: "🇻🇪", dialCode: "+58" },
  { code: "US" as CountryCode, flag: "🇺🇸", dialCode: "+1" },
  { code: "ES" as CountryCode, flag: "🇪🇸", dialCode: "+34" },
  { code: "MX" as CountryCode, flag: "🇲🇽", dialCode: "+52" },
];

export function stripFormatting(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string, countryCode: CountryCode): string {
  const digits = stripFormatting(value);

  switch (countryCode) {
    case "VE":
    case "US": {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    case "ES": {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
    }
    case "MX": {
      if (digits.length <= 2) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }
  }
}
