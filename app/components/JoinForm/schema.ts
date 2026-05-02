import {
  object,
  pipe,
  string,
  boolean,
  picklist,
  minLength,
  regex,
  check,
  forward,
  type InferOutput,
} from "valibot";
import {
  type CountryCode,
  COUNTRY_CONFIG,
  stripFormatting,
} from "./phoneFormatter";

export const joinFormSchema = pipe(
  object({
    name: pipe(string(), minLength(2, "Ingresa tu nombre completo")),
    countryCode: picklist(["VE", "US", "ES", "MX"]),
    prefix: pipe(string(), regex(/^\+\d{1,3}$/, "Prefijo inválido")),
    number: pipe(string(), minLength(1, "Ingresa tu número de teléfono")),
    consent: pipe(
      boolean(),
      check((v) => v === true, "Debes aceptar para continuar"),
    ),
  }),
  forward(
    check((value) => {
      const config = COUNTRY_CONFIG[value.countryCode as CountryCode];
      const digits = stripFormatting(value.number);
      return digits.length >= config.minLength;
    }, "Número de teléfono incompleto"),
    ["number"],
  ),
);

export type JoinFormValues = InferOutput<typeof joinFormSchema>;
