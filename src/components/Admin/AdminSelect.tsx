import { type KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { Check, ChevronDown } from "../site/Icons";

export type AdminSelectOption = {
  value: string;
  label: string;
  meta?: string;
};

type AdminSelectProps = {
  options: AdminSelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  ariaLabel?: string;
  variant?: "pill" | "stacked" | "field";
  disabled?: boolean;
  required?: boolean;
  name?: string;
};

export function AdminSelect({
  options,
  value,
  onChange,
  label,
  ariaLabel,
  variant = "pill",
  disabled = false,
  required = false,
  name,
}: AdminSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex];

  function close(refocus: boolean) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    close(true);
  }

  function typeahead(key: string) {
    const now = Date.now();
    typed.current.text = now - typed.current.at > 600 ? key : typed.current.text + key;
    typed.current.at = now;

    const term = typed.current.text.toLowerCase();
    const match = options.findIndex((option) => option.label.toLowerCase().startsWith(term));
    if (match >= 0) setActive(match);
  }

  useEffect(() => {
    if (!open) return;
    setActive(selectedIndex);
  }, [open, selectedIndex]);

  useLayoutEffect(() => {
    if (!open) {
      setDropUp(false);
      return;
    }
    const trigger = triggerRef.current;
    const menu = listRef.current;
    if (!trigger || !menu) return;

    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 16;
    const above = rect.top - 16;
    setDropUp(menu.offsetHeight > below && above > below);
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const moves: Record<string, number> = {
      ArrowDown: Math.min(active + 1, options.length - 1),
      ArrowUp: Math.max(active - 1, 0),
      Home: 0,
      End: options.length - 1,
    };

    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(active);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      close(false);
      return;
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      typeahead(event.key);
    }
  }

  if (!selected) return null;

  return (
    <div className={`admin-picker${variant === "pill" ? "" : ` ${variant}`}`} ref={rootRef}>
      {label ? (
        <span className="admin-picker-label" id={`${id}-label`}>
          {label}
        </span>
      ) : null}

      <div className="admin-picker-anchor">
        <button
          type="button"
          ref={triggerRef}
          className="admin-picker-trigger"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          {...(label ? { "aria-labelledby": `${id}-label ${id}-value` } : { "aria-label": ariaLabel })}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          <span className="admin-picker-value" id={`${id}-value`}>
            {selected.label}
          </span>
          {selected.meta ? <em className="admin-picker-count">{selected.meta}</em> : null}
          <ChevronDown />
        </button>

        {required ? (
          <input
            className="admin-picker-native"
            tabIndex={-1}
            aria-hidden="true"
            name={name}
            required
            disabled={disabled}
            value={value}
            onChange={() => {}}
          />
        ) : null}

        {open ? (
          <ul
            className={`admin-picker-menu${dropUp ? " up" : ""}`}
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            {...(label ? { "aria-labelledby": `${id}-label` } : { "aria-label": ariaLabel })}
            aria-activedescendant={`${id}-option-${active}`}
            onKeyDown={onListKeyDown}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={`admin-picker-option${index === active ? " active" : ""}${
                  index === selectedIndex ? " selected" : ""
                }`}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(index)}
              >
                <Check />
                <span>{option.label}</span>
                {option.meta ? <em>{option.meta}</em> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
