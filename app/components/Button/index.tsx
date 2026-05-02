import { Spinner } from "../Spinner";
import styles from "./Button.module.css";

type ButtonProps = React.ComponentPropsWithRef<"button"> & {
  variant?: "cta";
  size?: "small" | "medium" | "large";
  width?: "full" | "fit";
  isLoading?: boolean;
};

export function Button({
  children,
  type = "button",
  variant,
  size = "medium",
  width,
  isLoading,
  ...rest
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "cta":
        return styles.cta;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return styles.small;
      case "medium":
        return styles.medium;
      case "large":
        return styles.large;
    }
  };

  const getWidthStyles = () => {
    switch (width) {
      case "full":
        return styles.full;
      case "fit":
        return styles.fit;
    }
  };

  const buttonClasses = [
    styles.button,
    getVariantStyles(),
    getSizeStyles(),
    getWidthStyles(),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      {...rest}
      className={buttonClasses}
      disabled={isLoading || rest.disabled}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
