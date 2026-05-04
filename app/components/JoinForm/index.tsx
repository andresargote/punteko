"use client";

import { useState, useTransition } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "../Button";
import Checkbox from "../Checkbox";
import { Input } from "../Input";
import { PhoneInput } from "../PhoneInput";
import { COUNTRY_CONFIG, type CountryCode } from "./phoneFormatter";
import { getFieldError } from "./getFieldError";
import { joinFormSchema } from "./schema";
import { signUpWithPhone } from "../../actions/signUpWithPhone";
import { verifyOtp } from "../../actions/verifyOtp";
import styles from "./JoinForm.module.css";

type Step = "register" | "verify";

export default function JoinForm() {
  const [step, setStep] = useState<Step>("register");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    countryCode: "",
    consent: false,
  });
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      name: "",
      countryCode: "VE" as CountryCode,
      prefix: "+58",
      number: "",
      consent: false,
    },
    validators: {
      onChange: joinFormSchema,
    },
    onSubmit: ({ value }) => {
      const digits = value.number.replace(/\D/g, "");
      const fullPhone = `${value.prefix}${digits}`;

      startTransition(async () => {
        const result = await signUpWithPhone({
          phone: fullPhone,
          merchantSlug: "kromi",
        });

        if (result.error) {
          alert(result.error);
        } else {
          setPhone(fullPhone);
          setFormData({
            name: value.name,
            countryCode: value.countryCode,
            consent: value.consent,
          });
          setStep("verify");
        }
      });
    },
  });

  const handleVerifyOtp = () => {
    if (!otp) return;

    startTransition(async () => {
      const result = await verifyOtp({
        phone,
        token: otp,
        merchantSlug: "kromi",
        name: formData.name,
        countryCode: formData.countryCode,
        consent: formData.consent,
      });

      if (result.error) {
        alert(result.error);
        return;
      }
    });
  };

  if (step === "verify") {
    return (
      <form
        aria-label="Verificación de código para completar el registro"
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleVerifyOtp();
        }}
      >
        <p className={styles.otpMessage}>
          Hemos enviado un código de verificación a <strong>{phone}</strong>
        </p>

        <div className={styles.formFields}>
          <Input
            id="otp"
            label="Código de verificación"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
          />

          <Button
            type="submit"
            variant="cta"
            width="full"
            isLoading={isPending}
            disabled={otp.length < 6 || isPending}
          >
            Verificar código
          </Button>
        </div>

        <button
          type="button"
          className={styles.resendLink}
          onClick={() => {
            startTransition(async () => {
              const result = await signUpWithPhone({
                phone,
                merchantSlug: "kromi",
              });
              if (result.error) alert(result.error);
            });
          }}
          disabled={isPending}
        >
          Reenviar código
        </button>
      </form>
    );
  }

  return (
    <form
      aria-label="Registro al programa de fidelidad"
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className={styles.formFields}>
        <form.Field name="name">
          {(field) => (
            <Input
              id="name"
              label="Nombre completo"
              placeholder="José González"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={getFieldError(
                field.state.meta.errors,
                field.state.meta.isTouched,
              )}
            />
          )}
        </form.Field>

        <form.Field name="countryCode">
          {(countryField) => (
            <form.Field name="prefix">
              {(prefixField) => (
                <form.Field name="number">
                  {(numberField) => (
                    <div className={styles.phoneFieldAndConsent}>
                      <PhoneInput
                        id="phone"
                        label="Número de teléfono"
                        countryCode={countryField.state.value as CountryCode}
                        onCountryChange={(code) => {
                          countryField.handleChange(code);
                          prefixField.handleChange(COUNTRY_CONFIG[code].prefix);
                        }}
                        value={numberField.state.value}
                        onChange={(digits) => numberField.handleChange(digits)}
                        onBlur={numberField.handleBlur}
                        error={getFieldError(
                          numberField.state.meta.errors,
                          numberField.state.meta.isTouched,
                        )}
                      />
                      <form.Field name="consent">
                        {(consentField) => (
                          <label className={styles.consent} htmlFor="consent">
                            <Checkbox
                              id="consent"
                              checked={consentField.state.value}
                              onChange={(checked) =>
                                consentField.handleChange(checked)
                              }
                              onBlur={consentField.handleBlur}
                            />
                            <p className={styles.consentText}>
                              Al unirte aceptas que Kromi y Punteko te envíen
                              ofertas y novedades por WhatsApp. Sin spam, puedes
                              salirte cuando quieras.
                            </p>
                          </label>
                        )}
                      </form.Field>
                    </div>
                  )}
                </form.Field>
              )}
            </form.Field>
          )}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            variant="cta"
            width="full"
            isLoading={isSubmitting || isPending}
            disabled={!canSubmit || isPending}
          >
            Unirme{" "}
            <span className="sr-only">
              al programa de fidelidad de Kromi Club
            </span>
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
