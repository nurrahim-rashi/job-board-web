import { useEffect, useMemo, useState } from "react";
import { Footer } from "../components/Footer";
import { BrowseFilters, type DateFilter, type SortKey } from "../components/BrowseJobs/BrowseFilters";
import { BrowseHero } from "../components/BrowseJobs/BrowseHero";
import { categories, distanceKm, jobs, locations } from "../components/BrowseJobs/jobsData";
import { JobsResults } from "../components/BrowseJobs/JobsResults";
import { Navbar } from "../components/Navbar";

export default function BrowseJobsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("any");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  useEffect(() => {
    if (!navigator.geolocation || !navigator.permissions) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((permission) => {
        if (permission.state !== "granted" || cancelled) return;
        navigator.geolocation.getCurrentPosition((position) => {
          if (cancelled) return;
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setSort("nearest");
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  const results = useMemo(() => {
    const now = Date.now();
    const term = query.trim().toLowerCase();
    return [...jobs].filter((job) => {
      if (term && !`${job.title} ${job.company} ${job.tags.join(" ")}`.toLowerCase().includes(term)) return false;
      if (category !== "all" && job.category !== category) return false;
      if (location !== "all" && job.city !== location) return false;
      const postedAt = new Date(job.postedAt).getTime();
      if (dateFilter === "7d" && now - postedAt > 7 * 86_400_000) return false;
      if (dateFilter === "30d" && now - postedAt > 30 * 86_400_000) return false;
      if (dateFilter === "range" && ((from && postedAt < new Date(from).getTime()) || (to && postedAt > new Date(to).getTime() + 86_400_000))) return false;
      return true;
    }).sort((left, right) => sort === "nearest" && coords ? distanceKm(coords, left) - distanceKm(coords, right) : sort === "oldest" ? +new Date(left.postedAt) - +new Date(right.postedAt) : +new Date(right.postedAt) - +new Date(left.postedAt));
  }, [category, coords, dateFilter, from, location, query, sort, to]);
  const distances = useMemo(() => coords ? Object.fromEntries(results.map((job) => [job.slug, distanceKm(coords, job)])) : {}, [coords, results]);
  const reset = () => { setQuery(""); setCategory("all"); setLocation("all"); setDateFilter("any"); setFrom(""); setTo(""); setSort(coords ? "nearest" : "newest"); };
  const locate = () => { if (!navigator.geolocation) return; setLocating(true); navigator.geolocation.getCurrentPosition((position) => { setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }); setSort("nearest"); setLocating(false); }, () => setLocating(false), { timeout: 8000 }); };
  const activeFilters = Boolean(query || category !== "all" || location !== "all" || dateFilter !== "any");
  return <div id="top" className="browse-jobs-page"><Navbar /><main><BrowseHero locating={locating} located={Boolean(coords)} onLocate={locate} /><BrowseFilters query={query} category={category} location={location} dateFilter={dateFilter} from={from} to={to} sort={sort} categories={categories} locations={locations} showNearest={Boolean(coords)} activeFilters={activeFilters} onQueryChange={setQuery} onCategoryChange={setCategory} onLocationChange={setLocation} onDateFilterChange={setDateFilter} onFromChange={setFrom} onToChange={setTo} onSortChange={setSort} onReset={reset} /><JobsResults jobs={results} distances={distances} onReset={reset} /></main><Footer /></div>;
}
