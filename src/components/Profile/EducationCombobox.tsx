import { useMemo, useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  suggestions: string[];
  placeholder: string;
  onQuery?: (query: string) => void;
  required?: boolean;
};

export function EducationCombobox({
  name,
  defaultValue = "",
  suggestions,
  placeholder,
  onQuery,
  required = false,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<number | null>(null);
  const queryTimer = useRef<number | null>(null);
  const matches = useMemo(() => {
    const query = value.trim().toLocaleLowerCase("en");
    return [...new Set(suggestions)]
      .filter((suggestion) =>
        !query || suggestion.toLocaleLowerCase("en").includes(query),
      )
      .slice(0, 10);
  }, [suggestions, value]);

  return (
    <div className="education-combobox">
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        required={required}
        onFocus={() => {
          if (blurTimer.current) window.clearTimeout(blurTimer.current);
          setOpen(true);
          onQuery?.(value);
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 150);
        }}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          setOpen(true);
          if (queryTimer.current) window.clearTimeout(queryTimer.current);
          queryTimer.current = window.setTimeout(() => onQuery?.(next), 250);
        }}
      />
      {open && (
        <div className="education-combobox-menu" role="listbox">
          {matches.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              role="option"
              onMouseDown={(event) => {
                event.preventDefault();
                setValue(suggestion);
                setOpen(false);
              }}
            >
              {suggestion}
            </button>
          ))}
          {value.trim().length > 0 && matches.length === 0 && (
            <span>No match yet. You can keep your own entry.</span>
          )}
        </div>
      )}
    </div>
  );
}
