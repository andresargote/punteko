import styles from "./Checkbox.module.css";

type CheckboxProps = {
  id: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
};

export default function Checkbox({ id, checked, onChange, onBlur }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      onBlur={onBlur}
      aria-label="Checkbox"
      className={styles.checkbox}
    />
  );
}
