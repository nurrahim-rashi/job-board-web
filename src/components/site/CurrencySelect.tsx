import { currencyOptions } from "../../lib/currency";

type Props = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (currency: string) => void;
  id?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

export function CurrencySelect({
  name,
  value,
  defaultValue,
  onChange,
  id,
  disabled,
  ariaLabel = "Currency",
}: Props) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange?.(event.target.value)}
    >
      {currencyOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
