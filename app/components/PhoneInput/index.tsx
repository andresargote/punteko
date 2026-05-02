import React, { useId } from "react";
import {
  type CountryCode,
  COUNTRIES,
  COUNTRY_CONFIG,
  formatPhone,
  stripFormatting,
} from "../JoinForm/phoneFormatter";
import styles from "./PhoneInput.module.css";

type PhoneInputProps = Omit<
  React.ComponentPropsWithRef<"input">,
  "value" | "onChange" | "type"
> & {
  label: string;
  error?: string;
  countryCode?: CountryCode;
  onCountryChange?: (code: CountryCode) => void;
  value?: string;
  onChange?: (digits: string) => void;
};

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      label,
      error,
      countryCode = "VE",
      onCountryChange,
      value = "",
      onChange,
      id: externalId,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = externalId ?? generatedId;
    const errorId = `${inputId}-error`;
    const countrySelectId = `${inputId}-country`;
    const config = COUNTRY_CONFIG[countryCode];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const digits = stripFormatting(raw);
      const truncated = digits.slice(0, config.minLength);
      onChange?.(truncated);
    };

    const displayValue = value ? formatPhone(value, countryCode) : "";

    return (
      <div className={styles.wrapper}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <div className={`${styles.inputWrapper} ${error ? styles.errorInput : ""}`} role="group" aria-label={label}>
          <select
            id={countrySelectId}
            className={styles.countrySelect}
            aria-label="Código de país"
            value={countryCode}
            onChange={(e) => {
              onCountryChange?.(e.target.value as CountryCode);
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.dialCode}
              </option>
            ))}
          </select>
          <input
            id={inputId}
            ref={ref}
            type="tel"
            value={displayValue}
            onChange={handleChange}
            placeholder={config.placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={styles.phoneInput}
            {...rest}
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </div>
    );
  },
);
