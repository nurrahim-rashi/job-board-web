import { useEffect, useMemo, useState } from "react";
import { Footer } from "../components/Footer";
import { BrowseFilters, type DateFilter, type SortKey } from "../components/BrowseJobs/BrowseFilters";
import { BrowseHero } from "../components/BrowseJobs/BrowseHero";
import { JobsResults } from "../components/BrowseJobs/JobsResults";
import { Navbar } from "../components/Navbar";
import { getPublicJobs, type PublicJob } from "../services/job.service";

const categories = ["TECHNOLOGY", "FINANCE", "MARKETING", "SALES", "DESIGN", "HUMAN_RESOURCES", "OPERATIONS", "EDUCATION", "HEALTHCARE", "OTHER"];

export default function BrowseJobsPage() {
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("all"); const [location, setLocation] = useState("all"); const [dateFilter, setDateFilter] = useState<DateFilter>("any"); const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [sort, setSort] = useState<SortKey>("newest"); const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null); const [locating, setLocating] = useState(false); const [jobs, setJobs] = useState<PublicJob[]>([]); const [loading, setLoading] = useState(true);
  const locations = useMemo(() => [...new Set(jobs.map((job) => job.cityLocation))].sort(), [jobs]);
  useEffect(() => { const timer = window.setTimeout(() => { setLoading(true); getPublicJobs({ title: query || undefined, category: category === "all" ? undefined : category, city: location === "all" ? undefined : location, dateFrom: dateFilter === "range" ? from || undefined : dateFilter === "7d" ? new Date(Date.now() - 7 * 86_400_000).toISOString() : dateFilter === "30d" ? new Date(Date.now() - 30 * 86_400_000).toISOString() : undefined, dateTo: dateFilter === "range" ? to || undefined : undefined, sort, latitude: coords?.lat, longitude: coords?.lng, limit: 50 }).then(setJobs).catch(() => setJobs([])).finally(() => setLoading(false)); }, 250); return () => window.clearTimeout(timer); }, [category, coords, dateFilter, from, location, query, sort, to]);
  const locate = () => { if (!navigator.geolocation) return; setLocating(true); navigator.geolocation.getCurrentPosition((position) => { setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }); setSort("nearest"); setLocating(false); }, () => setLocating(false), { timeout: 8000 }); };
  const reset = () => { setQuery(""); setCategory("all"); setLocation("all"); setDateFilter("any"); setFrom(""); setTo(""); setSort(coords ? "nearest" : "newest"); };
  const activeFilters = Boolean(query || category !== "all" || location !== "all" || dateFilter !== "any");
  return <div id="top" className="browse-jobs-page"><Navbar /><main><BrowseHero locating={locating} located={Boolean(coords)} onLocate={locate} /><BrowseFilters query={query} category={category} location={location} dateFilter={dateFilter} from={from} to={to} sort={sort} categories={categories} locations={locations} showNearest={Boolean(coords)} activeFilters={activeFilters} onQueryChange={setQuery} onCategoryChange={setCategory} onLocationChange={setLocation} onDateFilterChange={setDateFilter} onFromChange={setFrom} onToChange={setTo} onSortChange={setSort} onReset={reset} /><JobsResults jobs={jobs} loading={loading} onReset={reset} /></main><Footer /></div>;
}
