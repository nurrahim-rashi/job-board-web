import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Briefcase, MapPin, Search } from "../site/Icons";
import { Stars } from "../site/Stars";
import type { DashboardOverview } from "../../types/auth";
import { getPublicJobs, type PublicJob } from "../../services/job.service";
import { getCountries, type Region } from "../../services/region.service";

export function HeroSection({
  overview,
}: {
  overview: DashboardOverview | null;
  loading: boolean;
}) {
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [countries, setCountries] = useState<Region[]>([]);
  const [suggestions, setSuggestions] = useState<PublicJob[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    setLocation(overview?.city ?? "");
  }, [overview]);

  useEffect(() => {
    getCountries().then(setCountries).catch(() => setCountries([{ code: "ID", name: "Indonesia" }]));
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    const timer = window.setTimeout(() => {
      const isCountry = countries.some((country) => country.name.toLowerCase() === location.trim().toLowerCase());
      setSuggestionsLoading(true);
      getPublicJobs({ title: query.trim(), category: category || undefined, city: location.trim() && !isCountry ? location.trim() : undefined, limit: 6 })
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setSuggestionsLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [category, countries, location, query]);

  function searchJobs(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    if (location.trim() && !countries.some((country) => country.name.toLowerCase() === location.trim().toLowerCase())) params.set("city", location.trim());
    window.location.assign(`/jobs${params.size ? `?${params}` : ""}`);
  }

  return (
    <section className="dashboard-hero">
      <div className="night-sky" />
      <div className="night-overlay" />
      <Stars />
      <div className="dashboard-wrap">
        <p className="eyebrow light">Welcome back</p>
        <h1>
          Good to see you{overview ? `, ${overview.name}.` : "."}
        </h1>
        <div className="dashboard-search-shell">
        <form className="dashboard-search" onSubmit={searchJobs}>
          <label>
            <Search />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Job title, keyword, or company" />
          </label>
          <label>
            <Briefcase />
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Job category">
              <option value="">All job categories</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="FINANCE">Finance</option>
              <option value="MARKETING">Marketing</option>
              <option value="SALES">Sales</option>
              <option value="DESIGN">Design</option>
              <option value="HUMAN_RESOURCES">Human Resources</option>
              <option value="OPERATIONS">Operations</option>
              <option value="EDUCATION">Education</option>
              <option value="HEALTHCARE">Healthcare</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label>
            <MapPin />
            <input
              list="homepage-country-options"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Your city"
            />
            <datalist id="homepage-country-options">{countries.map((country) => <option key={country.code} value={country.name} />)}</datalist>
          </label>
          <button type="submit">
            Search <ArrowRight />
          </button>
        </form>
        {(suggestionsLoading || suggestions.length > 0) && <div className="homepage-job-suggestions" role="listbox" aria-label="Matching jobs">
          {suggestionsLoading ? <div className="homepage-suggestion-loading"><i /><span><i /><i /></span></div> : suggestions.map((job) => <a key={job.id} href={`/jobs?q=${encodeURIComponent(job.title)}&city=${encodeURIComponent(job.cityLocation)}`} role="option"><span><b>{job.title}</b><small>{job.company.companyName}</small></span><em>{job.cityLocation}, Indonesia</em><ArrowRight /></a>)}
        </div>}
        </div>
      </div>
    </section>
  );
}
