import { useEffect, useMemo, useRef, useState } from "react";
import { Close, Search } from "./Icons";

export type LocationFilterOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  options: LocationFilterOption[];
  placeholder: string;
  loadingLabel: string;
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: string) => void;
};

export function LocationFilterCombobox({
  value,
  options,
  placeholder,
  loadingLabel,
  disabled = false,
  loading = false,
  onChange,
}: Props) {
  const [query, setQuery] = useState(value === "all" ? "" : value);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<number | null>(null);

  useEffect(() => {
    if (value !== "all") setQuery(value);
    else if (!open) setQuery("");
  }, [open, value]);

  const matches = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("en");
    return (Array.isArray(options) ? options : []).filter(
      (option) =>
        !term ||
        option.value.toLocaleLowerCase("en").includes(term) ||
        option.label.toLocaleLowerCase("en").includes(term),
    );
  }, [options, query]);

  const select = (nextValue: string) => {
    setQuery(nextValue === "all" ? "" : nextValue);
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={`country-combobox${disabled ? " is-disabled" : ""}`}>
      <Search />
      <input
        disabled={disabled}
        aria-label={placeholder}
        aria-autocomplete="list"
        aria-expanded={open}
        value={query}
        placeholder={placeholder}
        onFocus={() => {
          if (blurTimer.current) window.clearTimeout(blurTimer.current);
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 150);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange("all");
          setOpen(true);
        }}
      />
      {query && !disabled && (
        <button
          type="button"
          aria-label={`Clear ${placeholder.toLocaleLowerCase("en")}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => select("all")}
        >
          <Close />
        </button>
      )}
      {open && !disabled && (
        <div className="country-combobox-menu" role="listbox">
          {!query && (
            <button
              type="button"
              role="option"
              onMouseDown={() => select("all")}
            >
              {placeholder}
            </button>
          )}
          {matches.map((option) => (
            <button
              type="button"
              role="option"
              key={`${option.value}-${option.label}`}
              onMouseDown={() => select(option.value)}
            >
              {option.label}
            </button>
          ))}
          {loading && <span>{loadingLabel}</span>}
          {!loading && matches.length === 0 && (
            <span>No matching location found.</span>
          )}
        </div>
      )}
    </div>
  );
}
