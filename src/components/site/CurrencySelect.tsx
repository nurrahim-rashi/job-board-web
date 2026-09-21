import { useEffect, useMemo, useRef, useState } from "react";
import { currencyOptions } from "../../lib/currency";
import { Search } from "./Icons";
import { suppressBrowserAutofill } from "../../lib/form";

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
  defaultValue = "IDR",
  onChange,
  id,
  disabled,
  ariaLabel = "Currency",
}: Props) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const [query, setQuery] = useState(selected);
  const [debouncedQuery, setDebouncedQuery] = useState(selected);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) setQuery(selected);
  }, [open, selected]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const matches = useMemo(() => {
    const term = debouncedQuery.trim().toLocaleLowerCase("en");
    return currencyOptions
      .filter(
        (option) =>
          !term ||
          option.value.toLocaleLowerCase("en").includes(term) ||
          option.label.toLocaleLowerCase("en").includes(term),
      )
      .slice(0, 12);
  }, [debouncedQuery]);

  const select = (currency: string) => {
    setInternalValue(currency);
    setQuery(currency);
    onChange?.(currency);
    setOpen(false);
  };

  return (
    <div className={`country-combobox currency-combobox${disabled ? " is-disabled" : ""}`}>
      <Search />
      {name && <input type="hidden" name={name} value={selected} />}
      <input
        id={id}
        type="text"
        value={query}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={open}
        placeholder="Type a currency code or name"
        {...suppressBrowserAutofill}
        onFocus={(event) => {
          if (blurTimer.current) window.clearTimeout(blurTimer.current);
          setOpen(true);
          event.currentTarget.select();
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => {
            setOpen(false);
            setQuery(selected);
          }, 150);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
      />
      {open && !disabled && (
        <div className="country-combobox-menu" role="listbox">
          {matches.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === selected}
              onMouseDown={(event) => {
                event.preventDefault();
                select(option.value);
              }}
            >
              {option.label}
            </button>
          ))}
          {matches.length === 0 && <span>No matching currency found.</span>}
        </div>
      )}
    </div>
  );
}
