import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Close, MapPin, Search } from "../site/Icons";
import { Stars } from "../site/Stars";
import type { DashboardOverview } from "../../types/auth";
import { getPublicJobs, type PublicJob } from "../../services/job.service";
import {
  searchWorldwideLocations,
  type WorldwideLocation,
} from "../../services/region.service";
import { formatJobLocation } from "../../lib/location";
import { suppressBrowserAutofill } from "../../lib/form";

const locationTypeLabel = (type: WorldwideLocation["type"]) =>
  type === "country"
    ? "Country"
    : type === "state"
      ? "Province / state"
      : "City / regency";

export function HeroSection({
  overview,
}: {
  overview: DashboardOverview | null;
  loading: boolean;
}) {
  const [location, setLocation] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<WorldwideLocation | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PublicJob[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<
    WorldwideLocation[]
  >([]);
  const [locationFocused, setLocationFocused] = useState(false);
  const [locationSuggestionsLoading, setLocationSuggestionsLoading] =
    useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const locationFilters: {
    city?: string;
    provinceName?: string;
    country?: string;
  } = selectedLocation
    ? {
        ...(selectedLocation.type === "city"
          ? { city: selectedLocation.name }
          : {}),
        ...(selectedLocation.type === "state"
          ? { provinceName: selectedLocation.name }
          : {}),
        country: selectedLocation.country,
      }
    : { city: location.trim() || undefined };

  function createJobsUrl(roleQuery = query.trim()) {
    const params = new URLSearchParams();
    if (roleQuery) params.set("q", roleQuery);
    if (locationFilters.city) params.set("city", locationFilters.city);
    if (locationFilters.provinceName)
      params.set("provinceName", locationFilters.provinceName);
    if (locationFilters.country)
      params.set("country", locationFilters.country);
    return `/jobs${params.size ? `?${params}` : ""}`;
  }

  useEffect(() => {
    setLocation(overview?.city ?? "");
  }, [overview]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setSuggestionsLoading(true);
      getPublicJobs({
        title: query.trim(),
        ...locationFilters,
        limit: 6,
      })
        .then((jobs) => active && setSuggestions(jobs))
        .catch(() => active && setSuggestions([]))
        .finally(() => active && setSuggestionsLoading(false));
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [location, query, selectedLocation]);

  useEffect(() => {
    if (
      !locationFocused ||
      location.trim().length < 2 ||
      selectedLocation?.label === location.trim()
    ) {
      setLocationSuggestions([]);
      setLocationSuggestionsLoading(false);
      return;
    }
    // Without this guard a slow earlier request can land after a newer one and
    // replace the suggestions for the query the user is actually typing.
    let active = true;
    const timer = window.setTimeout(() => {
      setLocationSuggestionsLoading(true);
      searchWorldwideLocations(location.trim())
        .then((locations) => active && setLocationSuggestions(locations))
        .catch(() => active && setLocationSuggestions([]))
        .finally(() => active && setLocationSuggestionsLoading(false));
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [location, locationFocused, selectedLocation]);

  function searchJobs(event: FormEvent) {
    event.preventDefault();
    window.location.assign(createJobsUrl());
  }

  return (
    <section className="dashboard-hero">
      <div className="night-sky" />
      <div className="night-overlay" />
      <Stars />
      <div className="dashboard-wrap">
        <p className="eyebrow light">Welcome back</p>
        <h1>Good to see you{overview ? `, ${overview.name}.` : "."}</h1>
        <p className="dashboard-hero-copy">
          Find work that fits your strengths, your ambitions, and where you want
          to grow next.
        </p>
        <div className="dashboard-search-shell">
          <form className="dashboard-search" onSubmit={searchJobs}>
            <label>
              <Search />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Job title, keyword, or company"
              />
              {query && (
                <button
                  type="button"
                  className="dashboard-search-clear"
                  aria-label="Clear role search"
                  title="Clear role search"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                  }}
                >
                  <Close />
                </button>
              )}
            </label>
            <label className="homepage-location-search">
              <MapPin />
              <input
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setSelectedLocation(null);
                }}
                onFocus={() => setLocationFocused(true)}
                onBlur={() => setLocationFocused(false)}
                placeholder="City, province, state, or country"
                {...suppressBrowserAutofill}
              />
              {location && (
                <button
                  type="button"
                  className="dashboard-search-clear"
                  aria-label="Clear location"
                  title="Clear location"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setLocation("");
                    setSelectedLocation(null);
                    setLocationSuggestions([]);
                  }}
                >
                  <Close />
                </button>
              )}
              {locationFocused && location.trim().length >= 2 && (
                <div
                  className="homepage-location-suggestions"
                  role="listbox"
                  aria-label="Location suggestions"
                >
                  {locationSuggestionsLoading ? (
                    <div className="homepage-location-loading">
                      <i />
                      <span>
                        <i />
                        <i />
                      </span>
                    </div>
                  ) : locationSuggestions.length ? (
                    locationSuggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion.id}
                        role="option"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setLocation(suggestion.label);
                          setSelectedLocation(suggestion);
                          setLocationSuggestions([]);
                          setLocationFocused(false);
                        }}
                      >
                        <MapPin />
                        <span>
                          <b>{suggestion.label}</b>
                          <small>{locationTypeLabel(suggestion.type)}</small>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p>No matching locations found.</p>
                  )}
                  {!locationSuggestionsLoading &&
                    locationSuggestions.length > 0 && (
                      <small className="homepage-location-attribution">
                        Location data © OpenStreetMap contributors
                      </small>
                    )}
                </div>
              )}
            </label>
            <button type="submit">
              Search <ArrowRight />
            </button>
          </form>
          {!locationFocused &&
            (suggestionsLoading || query.trim().length >= 2) && (
            <div
              className="homepage-job-suggestions"
              role="listbox"
              aria-label="Matching jobs"
            >
              {suggestionsLoading ? (
                <div className="homepage-suggestion-loading">
                  <i />
                  <span>
                    <i />
                    <i />
                  </span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((job) => (
                  <a
                    key={job.id}
                    href={`/jobs?q=${encodeURIComponent(job.title)}&city=${encodeURIComponent(job.cityLocation)}&country=${encodeURIComponent(job.countryLocation)}`}
                    role="option"
                  >
                    <span>
                      <b>{job.title}</b>
                      <small>{job.company.companyName}</small>
                    </span>
                    <em>
                      {formatJobLocation(job)}
                    </em>
                    <ArrowRight />
                  </a>
                ))
              ) : (
                <a
                  className="homepage-search-fallback"
                  href={createJobsUrl()}
                  role="option"
                >
                  <span>
                    <b>
                      Search “{query.trim()}”
                      {location.trim() ? ` in ${location.trim()}` : ""}
                    </b>
                    <small>See all matching and related roles</small>
                  </span>
                  <ArrowRight />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
