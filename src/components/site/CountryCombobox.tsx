import { useEffect, useMemo, useRef, useState } from "react";
import {
  searchWorldwideLocations,
  type Region,
} from "../../services/region.service";
import { Close, Search } from "./Icons";

type Props = {
  value: string;
  countries: Region[];
  onChange: (country: string) => void;
};

export function CountryCombobox({ value, countries, onChange }: Props) {
  const [query, setQuery] = useState(value === "all" ? "" : value);
  const [remoteCountries, setRemoteCountries] = useState<Region[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const blurTimer = useRef<number | null>(null);

  useEffect(() => {
    if (value !== "all") setQuery(value);
    else if (!open) setQuery("");
  }, [open, value]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setRemoteCountries([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      searchWorldwideLocations(term)
        .then((locations) => {
          if (!active) return;
          setRemoteCountries(
            locations
              .filter((location) => location.type === "country")
              .map((location) => ({
                code: location.countryCode || location.id,
                name: location.country,
              })),
          );
        })
        .catch(() => active && setRemoteCountries([]))
        .finally(() => active && setLoading(false));
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const matches = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("en");
    const availableCountries = Array.isArray(countries) ? countries : [];
    const availableRemoteCountries = Array.isArray(remoteCountries)
      ? remoteCountries
      : [];
    const merged = [...availableCountries, ...availableRemoteCountries];
    const seen = new Set<string>();
    const filtered = merged
      .filter((country) => !term || country.name.toLocaleLowerCase("en").includes(term))
      .filter((country) => {
        const key = country.name.toLocaleLowerCase("en");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return term ? filtered.slice(0, 10) : filtered;
  }, [countries, query, remoteCountries]);

  const select = (country: string) => {
    setQuery(country);
    onChange(country || "all");
    setOpen(false);
  };

  return (
    <div className="country-combobox">
      <Search />
      <input
        aria-label="Search country"
        aria-autocomplete="list"
        aria-expanded={open}
        value={query}
        placeholder="All countries"
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
      {query && (
        <button
          type="button"
          aria-label="Clear country"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => select("")}
        >
          <Close />
        </button>
      )}
      {open && (
        <div className="country-combobox-menu" role="listbox">
          {!query && (
            <button type="button" role="option" onMouseDown={() => select("")}>
              All countries
            </button>
          )}
          {matches.map((country) => (
            <button
              type="button"
              role="option"
              key={`${country.code}-${country.name}`}
              onMouseDown={() => select(country.name)}
            >
              {country.name}
            </button>
          ))}
          {loading && <span>Searching countries…</span>}
          {!loading &&
            !query &&
            (!Array.isArray(countries) || countries.length === 0) && (
            <span>Loading countries…</span>
          )}
          {!loading && query.length >= 2 && matches.length === 0 && (
            <span>No country found.</span>
          )}
        </div>
      )}
    </div>
  );
}
